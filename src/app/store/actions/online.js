import axios from "@/utils/axios";
import { merge } from "lodash/object";

let status;
let alert;

export const setupSocket = ({ state, commit, dispatch }) => {
    const fingerprint = window.fingerprint || "";

    if (status && typeof status.close === "function") {
        status.close();
    }

    status = new EventSource(
        `${
            config.api
        }/live/status?fingerprint=${fingerprint}&handshake-interval=20000&lastEventId=12345&retry=3000`
    );

    status.addEventListener("open", () => {
        if (!state.online.status) {
            commit("SET_ONLINE");
        }

        dispatch("logOperator")
            .then(() => {
                dispatch("updateEssentials");
                dispatch("syncQueue");
            })
            .then(() => dispatch("listenAlerts"));
    });

    status.addEventListener("error", () => {
        if (state.online.status) {
            commit("SET_OFFLINE");
        }
    });
};

export const listenAlerts = ({ state, dispatch }) => {
    const token = state.auth.seller.token;

    if (alert && typeof alert.close === "function") {
        alert.close();
    }

    if (token && token.length > 0) {
        alert = new EventSource(
            `${
                config.api
            }/live/alert?authorization=Bearer ${token}&fingerprint=${
                window.fingerprint
            }&handshake-interval=20000&lastEventId=12345&retry=3000`
        );

        alert.addEventListener("message", e => {
            try {
                const data = JSON.parse(e.data);

                if (data && data.minimumViewTime) {
                    dispatch("alert", data);
                }
            } catch (err) {
                console.error("invalid alert detected", e.data, err);
            }
        });
    }
};

export const logOperator = store => {
    if (store.getters.tokenHeaders.headers || !store.state.auth.seller.isAuth) {
        return Promise.resolve();
    }

    const credentials = {
        meanOfLogin: config.loginMeanOfLogin,
        data: store.state.auth.seller.meanOfLogin,
        pin: store.state.auth.seller.pin
    };

    // Use axios to avoid a logOperator loop
    return axios
        .post("services/login", credentials, {
            headers: { "X-fingerprint": window.fingerprint }
        })
        .then(res => store.commit("UPDATE_TOKEN", res.data.token));
};

export const setSellers = (store, payload) => {
    store.commit("SET_SELLERS", payload);
};

export const setDefaultItems = (store, payload) => {
    store.commit("SET_DEFAULT_ITEMS", payload);
};

export const setBlockedCards = (store, payload) => {
    store.commit("SET_BLOCKED_CARDS", payload);
};

export const currentTokenAxios = (store, job) => {
    // We try to log-in the current seller before any request
    return store.dispatch("logOperator").then(() =>
        axios({
            method: job.method || "get",
            url: job.url,
            data: job.data,
            ...merge(
                { headers: { "X-fingerprint": window.fingerprint } },
                store.getters.tokenHeaders,
                job.params
            )
        })
    );
};

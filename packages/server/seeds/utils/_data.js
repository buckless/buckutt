module.exports = {
    user_id: '04ab4de8-095e-4ce3-b7d5-d0374ae89fc5',
    period_id: '39c93c99-70a2-4b15-bf60-1e5bf1d82692',
    event_id: 'a28a9a52-79a8-4115-91cc-9833edab39d9',
    point_id: '1681642c-8b1e-4614-9ef1-963ad4c061b8',
    group_id: 'c18fb66b-339e-4ea7-9f56-640bce0e2002',
    fundation_id: '499b2ff0-583f-4c23-a78f-7b0d153327fe',
    nfc_id: '44d07229-ff52-4afb-91dc-d84eddbd8248',
    web_id: 'fb1f6a3f-bbb3-407f-9ff7-b96cb158199b',
    item: obj =>
        Object.assign(obj, {
            created_at: new Date(),
            updated_at: new Date(),
            deleted_at: null,
            active: 1
        })
};

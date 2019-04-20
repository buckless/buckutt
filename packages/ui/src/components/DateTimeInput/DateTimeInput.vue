<template>
    <div class="datetime-input" @click="onClick">
        <Input
            :label="label"
            :pattern="time ? '\\d{2}\/\\d{2}\/\\d{4} \\d{2}:\\d{2}' : '\\d{2}\/\\d{2}/\\d{4}'"
            :placeholder="placeholder"
            :disabled="disabled"
            :value="inputValue"
            ref="input"
            @input="onInputChange"
            @focus="onOpen"
            @blur="onBlur"
        />
        <div class="picker" v-show="opened">
            <div class="nav">
                <div class="prev" @click="onPrev">
                    <Icon name="keyboard_arrow_left" :size="18" />
                </div>
                <div class="current">{{ current }}</div>
                <div class="next" @click="onNext">
                    <Icon name="keyboard_arrow_right" :size="18" />
                </div>
            </div>
            <div class="week">
                <div class="day-wrapper" v-for="(day, i) in weekHeader" :key="i">
                    <div class="day">
                        {{ day }}
                    </div>
                </div>
            </div>
            <div class="days">
                <div class="day-wrapper" v-for="(day, i) in days" :key="i">
                    <div
                        class="day"
                        :current="day.inMonth"
                        :isInRange="day.isInRange"
                        :today="day.isToday"
                        :active="isActive(day.fullDate)"
                        @click="day.isInRange && onSelectDate(day.fullDate)"
                    >
                        {{ day.date }}
                    </div>
                </div>
            </div>
            <div class="time" v-if="time">
                <Input
                    type="number"
                    placeholder="12"
                    :min="0"
                    :max="24"
                    v-model="hours"
                    small
                    @input="updateInputValue"
                    @focus="onSelfSelect"
                    @blur="onBlur"
                />
                <span class="separator">:</span>
                <Input
                    type="number"
                    placeholder="00"
                    :min="0"
                    :max="60"
                    v-model="minutes"
                    small
                    @input="updateInputValue"
                    @focus="onSelfSelect"
                    @blur="onBlur"
                />
            </div>
        </div>
    </div>
</template>

<script>
import Vue from 'vue';
import {
    format,
    addMonths,
    isBefore,
    isAfter,
    isSameDay,
    parse,
    getMinutes,
    getHours
} from 'date-fns';
import { fr } from 'date-fns/locale';
import Popper from 'popper.js';

import { getWeekDays, getDays } from './dateUtils';

/**
 * Date Time input
 */
export default {
    name: 'DateTimeInput',

    model: {
        prop: 'value',
        event: 'input'
    },

    props: {
        /**
         * Text label above the input
         */
        label: { type: String, required: true },
        /**
         * Placeholder when input value is null
         */
        placeholder: { type: String, default: '' },
        /**
         * Disable the input
         */
        disabled: { type: Boolean, disabled: false },
        /**
         * @model
         * Controls the input value
         */
        value: { type: Date, default: null },
        /**
         * Adds date to date picker
         */
        time: { type: Boolean, default: true },
        /**
         * Minimum date to choose
         */
        min: { type: Date },
        /**
         * Maximum date to choose
         */
        max: { type: Date },

        /**
         * Input format
         */
        format: { type: String, default: 'dd/MM/yyyy' }
    },

    data() {
        return {
            opened: false,
            inputValue: this.value && this.value.toLocaleDateString(),
            hours: this.value ? getHours(this.value).toString() : '12',
            minutes: this.value ? getMinutes(this.value).toString() : '00',
            activeDate: this.value,
            viewDate: new Date()
        };
    },

    mounted() {
        const reference = this.$el.querySelector('.input');
        const popper = this.$el.querySelector('.picker');
        this.popper = new Popper(reference, popper, {
            placement: 'bottom-start'
        });
    },

    beforeDestroy() {
        this.popper.destroy();
    },

    computed: {
        current() {
            return format(this.viewDate, 'MMM yyyy', { locale: fr });
        },

        weekHeader() {
            return getWeekDays(fr);
        },

        days() {
            return getDays(fr, this.viewDate, this.min, this.max);
        }
    },

    methods: {
        canChangeViewTo(newDate) {
            const isAfterMin = this.min ? isAfter(newDate, this.min) : true;
            const isBeforeMax = this.max ? isBefore(newDate, this.max) : true;

            return isAfterMin && isBeforeMax;
        },

        onPrev() {
            const newDate = addMonths(this.viewDate, -1);

            if (this.canChangeViewTo(newDate)) {
                this.viewDate = newDate;
            }
        },

        onNext() {
            const newDate = addMonths(this.viewDate, 1);

            if (this.canChangeViewTo(newDate)) {
                this.viewDate = newDate;
            }
        },

        updateInputValue() {
            const hours = parseInt(this.hours, 10);
            const minutes = parseInt(this.minutes, 10);

            const time =
                Number.isFinite(hours) &&
                Number.isFinite(minutes) &&
                [hours.toString().padStart(2, '0'), minutes.toString().padStart(2, '0')].join(':');

            this.inputValue = [format(this.activeDate, this.format), time].filter(i => i).join(' ');
        },

        onInputChange(newVal) {
            const [date, time] = newVal.split(' ');
            const [hours, minutes] = (time || '').split(':');

            this.activeDate = parse(date, this.format, new Date());
            this.hours = hours;
            this.minutes = minutes;
        },

        onClick(e) {
            e.stopPropagation();
        },

        onSelectDate(date) {
            this.activeDate = date;
            this.updateInputValue();
            this.$emit('input', date);
            this.$refs.input.$el.querySelector('input').focus();
        },

        isActive(date) {
            return this.activeDate && isSameDay(date, this.activeDate);
        },

        onSelfSelect(e) {
            e.target.select();
        },

        onOpen() {
            document.addEventListener('click', this.onClose);
            document.addEventListener('keyup', this.onClose);
            this.opened = true;
            Vue.nextTick(() => {
                this.popper.update();
            });
        },

        onBlur(e) {
            // related target is set when blurring to give focus to another element
            // if this element is not in this DateTimeInput, close
            // ex: clicking on another input
            if (e.relatedTarget && !this.$el.contains(e.relatedTarget)) {
                this.onClose(e);
            }
        },

        onClose(e) {
            // if keyup event and not escape, early return
            if (e && e instanceof KeyboardEvent && e.which !== 27) {
                return;
            }

            this.opened = false;
            document.removeEventListener('click', this.onClose);
            document.removeEventListener('keyup', this.onClose);
        }
    }
};
</script>

<style scoped>
.datetime-input {
    font-size: var(--typography-body-2-size);
}

.picker {
    width: 250px;
    margin: 8px 0;
    background-color: var(--grey-50);
    border-radius: var(--radius);
    box-shadow: var(--elevation-2dp);
    z-index: 100;
}

.nav {
    display: flex;
    height: 40px;
    align-items: center;
    user-select: none;
}

.prev,
.next {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    width: 40px;
    font-size: 24px;
    cursor: pointer;
    color: var(--foreground-dark-200);
}

.prev:hover,
.next:hover {
    color: var(--primary-300);
}

.current {
    flex: 1;
    text-align: center;
    text-transform: capitalize;
}

.week {
    display: flex;
    padding: 8px 12px 0 12px;
}

.week .day {
    flex: 1;
    text-align: center;
    text-transform: capitalize;
}

.days {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    padding: 0 12px 8px 12px;
    user-select: none;
}

.day-wrapper {
    height: 30px;
    width: 30px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
}

.day {
    height: 28px;
    width: 28px;
    display: flex;
    align-items: center;
    margin: 0 auto;
    justify-content: center;
    cursor: pointer;
}

.days .day {
    border-radius: var(--radius);
}

.days .day:hover {
    background-color: var(--primary-50);
}

.days .day:not([current]),
.days .day:not([isInRange]) {
    color: var(--foreground-dark-100);
}

.days .day[today] {
    color: var(--primary-300);
}

.days .day[active] {
    color: var(--foreground-light-300);
    background-color: var(--primary-300);
}

.time {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 12px 8px 12px;
}

.time > .separator {
    margin: 0 8px;
}
</style>

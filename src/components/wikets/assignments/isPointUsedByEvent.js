export function isPointUsedByEvent(wikets, newWiket) {
    const filteredEvents = wikets.filter(wiket => {
        const otherEvent =
            newWiket.period.event_id !== wiket.period.event_id && wiket.period.event.id;
        const overlap =
            newWiket.period.start <= wiket.period.end && newWiket.period.end >= wiket.period.start;

        return overlap && otherEvent;
    });

    return filteredEvents.length > 0;
}

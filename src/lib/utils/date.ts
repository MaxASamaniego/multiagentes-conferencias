export function getSeason (date: Date) {
    const month = date.getMonth();
    if (month >= 2 && month <= 5) {
        return 'spring';
    } else if (month >= 6 && month <= 8) {
        return 'summer';
    } else if (month >= 9 && month <= 11) {
        return 'autumn';
    } else {
        return 'winter';
    }

}
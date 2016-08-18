angular.module('ubermon').factory('ubermonConfig', function () {
    return {
        monitorTypes: {
            'h': 'HTTP(s)',
            'p': 'Ping',
            'o': 'Port',
            'k': 'Keyword'
        },
        monitorIntervals: {
            1: 'Every minute',
            2: 'Every 2 minutes',
            5: 'Every 5 minutes',
            10: 'Every 10 minutes',
            15: 'Every 15 minutes',
            20: 'Every 20 minutes',
            30: 'Every 30 minutes',
            60: 'Every 60 minutes'
        },
        recaptchaPubKey: '6LcCeRMTAAAAAJOmu2kbjXyOs07yf28tFt2sn9bF'
    };
});

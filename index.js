var sw;

navigator.serviceWorker.register('service-worker.js').then(function (registration) {
    sw = registration;
});


function showNotification() {
    webNotification.showNotification("my title", {
        serviceWorkerRegistration: sw,
        body: "body text",
        onClick: function () {
            console.log('Notification clicked.');
        },
        actions: [
            { action: 'dismiss', title: 'dismiss' },
            { action: 'later', title: 'see later' }
        ],
        autoClose: 10000
    }, function onShow(error, hide) {
        if (error) {
            window.alert('Unable to show notification: ' + error.message);
        }
        else {
            console.log('yay');
            hide();
        }
    });
}

function showNotification2() {
    webNotification.showNotification("my title", {
        body: "body text",
        onClick: function () {
            console.log('Notification clicked.');
        },
        autoClose: 10000
    }, function onShow(error, hide) {
        if (error) {
            printErr('onshow', error);
            window.alert('Unable to show notification: ' + error.message);
        }
        else {
            printErr('yay', error);
            printErr('hide', hide);
            console.log('yay');
            hide();
        }
    });
}

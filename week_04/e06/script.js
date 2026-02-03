document.addEventListener('DOMContentLoaded', function() {
    console.log("Page loaded! Initializing tooltips and popovers...");
    
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
    console.log("Found " + tooltipList.length + " tooltips");
    console.log("Found " + popoverList.length + " popovers");
    var popovers = document.querySelectorAll('[data-bs-toggle="popover"]');
    popovers.forEach(function(popover) {
        popover.addEventListener('shown.bs.popover', function () {
            popovers.forEach(function(otherPopover) {
                if (otherPopover !== popover) {
                    var popoverInstance = bootstrap.Popover.getInstance(otherPopover);
                    if (popoverInstance) {
                        popoverInstance.hide();
                    }
                }
            });
        });
    });
    window.showDemoAlert = function() {
        alert("This button doesn't have tooltips/popovers. It's just a regular button!");
    };
    
});
function showCodeExample() {
    var codeBox = document.getElementById('codeExample');
    if (codeBox.style.display === 'none') {
        codeBox.style.display = 'block';
    } else {
        codeBox.style.display = 'none';
    }
}
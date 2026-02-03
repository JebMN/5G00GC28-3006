document.addEventListener('DOMContentLoaded', function() {
    var form = document.getElementById('registrationForm');
    var password = document.getElementById('password');
    var confirmPassword = document.getElementById('confirmPassword');
    
    confirmPassword.addEventListener('input', function() {
        if (password.value !== confirmPassword.value) {
            confirmPassword.setCustomValidity('Passwords do not match');
            confirmPassword.classList.add('is-invalid');
            confirmPassword.classList.remove('is-valid');
        } else {
            confirmPassword.setCustomValidity('');
            confirmPassword.classList.add('is-valid');
            confirmPassword.classList.remove('is-invalid');
        }
    }); 
    form.addEventListener('submit', function(event) {
        event.preventDefault(); 
        event.stopPropagation();
        
        if (form.checkValidity()) {
            document.getElementById('successMessage').style.display = 'block';
            form.style.display = 'none';
            
            console.log('Form submitted successfully!');
            console.log('Name: ' + document.getElementById('name').value);
            console.log('Email: ' + document.getElementById('email').value);
        }     
        form.classList.add('was-validated');
    }, false);
        var inputs = form.querySelectorAll('input');
    inputs.forEach(function(input) {
        input.addEventListener('input', function() {
            if (input.checkValidity()) {
                input.classList.add('is-valid');
                input.classList.remove('is-invalid');
            } else {
                input.classList.add('is-invalid');
                input.classList.remove('is-valid');
            }
        });
    });
    
});
function resetForm() {
    document.getElementById('successMessage').style.display = 'none';
    document.getElementById('registrationForm').style.display = 'block';
    document.getElementById('registrationForm').reset();
    document.getElementById('registrationForm').classList.remove('was-validated');
    
    var inputs = document.querySelectorAll('.form-control');
    inputs.forEach(function(input) {
        input.classList.remove('is-valid');
        input.classList.remove('is-invalid');
    });
}
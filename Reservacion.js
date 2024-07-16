document.addEventListener("DOMContentLoaded", function() {
    const form = document.querySelector("form");
    const sendEmailBtn = document.getElementById("send-email-btn");
    const downloadPdfBtn = document.getElementById("download-pdf-btn");

    sendEmailBtn.addEventListener("click", function(e) {
        e.preventDefault();
        handleFormSubmission('email');
    });

    downloadPdfBtn.addEventListener("click", function(e) {
        e.preventDefault();
        handleFormSubmission('pdf');
    });

    function handleFormSubmission(action) {
        const formData = new FormData(form);
        
        if (action === 'email') {
            sendEmail(formData);
        } else if (action === 'pdf') {
            generatePDF(formData);
        }
    }

    function sendEmail(formData) {
        const templateParams = {
            name: formData.get('name'),
            email: formData.get('email'),
            restaurant_name: formData.get('restaurant-name'),
            restaurant_address: formData.get('restaurant-address'),
            date: formData.get('date'),
            time: formData.get('time'),
            guests: formData.get('guests'),
            event_type: formData.get('event-type'),
            message: formData.get('message')
        };

        emailjs.send('service_alj34m3', 'template_wmtno7t', templateParams)
            .then(function(response) {
                console.log('SUCCESS!', response.status, response.text);
                alert('Reserva enviada por correo. Por favor, revisa tu bandeja de entrada.');
            }, function(error) {
                console.log('FAILED...', error);
                alert('Error al enviar el correo. Por favor, intenta de nuevo.');
            });
    }

    function generatePDF(formData) {
        fetch('process_reservation.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log('Respuesta del servidor:', data);
            if (data.success) {
                alert(data.message);
                if (data.pdfUrl) {
                    window.open(data.pdfUrl, '_blank');
                }
            } else {
                alert("Error: " + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert("Ocurrió un error al generar el PDF.");
        });
    }

    // Configuración del botón de PayPal
    document.getElementById('pay-now').addEventListener('change', function() {
        var payNow = this.value;
        var paypalContainer = document.getElementById('paypal-button-container');
        var folioContainer = document.getElementById('folio-container');

        paypalContainer.innerHTML = '';

        if (payNow === 'yes') {
            paypal.Buttons({
                createOrder: function(data, actions) {
                    return actions.order.create({
                        purchase_units: [{
                            amount: {
                                value: '1.00'
                            }
                        }]
                    });
                },
                onApprove: function(data, actions) {
                    return actions.order.capture().then(function(details) {
                        alert('Transacción completada por ' + details.payer.name.given_name);
                    });
                }
            }).render('#paypal-button-container');

            paypalContainer.style.display = 'block';
            folioContainer.style.display = 'none';
        } else {
            paypalContainer.style.display = 'none';
            folioContainer.style.display = 'block';
            generateFolio();
        }
    });

    function generateFolio() {
        var folio = 'FOLIO-' + Math.floor(Math.random() * 1000000);
        document.getElementById('folio').innerText = folio;
    }

    // Llenar campos del restaurante desde la URL
    const urlParams = new URLSearchParams(window.location.search);
    const restaurantName = urlParams.get('restaurant-name');
    const restaurantAddress = urlParams.get('restaurant-address');

    if (restaurantName) {
        document.getElementById('restaurant-name').value = restaurantName;
    }
    if (restaurantAddress) {
        document.getElementById('restaurant-address').value = restaurantAddress;
    }
});

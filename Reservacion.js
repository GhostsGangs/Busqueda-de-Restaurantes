document.addEventListener("DOMContentLoaded", function() {
    const form = document.querySelector("form");
    const sendEmailBtn = document.getElementById("send-email-btn");
    const downloadPdfBtn = document.getElementById("download-pdf-btn");

    sendEmailBtn.addEventListener("click", function(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        if (!email) {
            alert('Por favor, ingrese una dirección de correo electrónico válida.');
            return;
        }
        handleFormSubmission('email');
    });

    downloadPdfBtn.addEventListener("click", function(e) {
        e.preventDefault();
        handleFormSubmission('pdf');
    });

    function handleFormSubmission(action) {
        const formData = new FormData(form);
        const reservaId = generarIdUnico();
        
        const reservaData = {};
        for (let [key, value] of formData.entries()) {
            reservaData[key] = value;
        }
        reservaData.id = reservaId;
    
        localStorage.setItem(`reserva_${reservaId}`, JSON.stringify(reservaData));
    
        if (action === 'email') {
            sendEmail(formData, reservaId);
        } else if (action === 'pdf') {
            generateAndDownloadPDF(reservaData);
        }
    }
    
    function generatePDFDataURL(reservaData) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        doc.setFontSize(18);
        doc.text('Detalles de la Reserva', 20, 20);
        
        doc.setFontSize(12);
        let y = 40;
        for (let [key, value] of Object.entries(reservaData)) {
            if (key !== 'id') {
                doc.text(`${key}: ${value}`, 20, y);
                y += 10;
            }
        }

        return doc.output('datauristring');
    }

    function sendEmail(formData, reservaId) {
        const reservaData = {};
        for (let [key, value] of formData.entries()) {
            reservaData[key] = value;
        }
        reservaData.id = reservaId;
    
        const pdfDataURL = generatePDFDataURL(reservaData);
    
        const templateParams = {
            to_email: formData.get('email'),
            name: formData.get('name'),
            restaurant_name: formData.get('restaurant-name'),
            restaurant_address: formData.get('restaurant-address'),
            date: formData.get('date'),
            time: formData.get('time'),
            guests: formData.get('guests'),
            event_type: formData.get('event-type'),
            message: formData.get('message'),
            pdf_url: pdfDataURL
        };
    
        console.log('PDF URL:', pdfDataURL); // Para depuración
    
        emailjs.send('service_z8q1zwl', 'template_yv1grrs', templateParams)
            .then(function(response) {
                console.log('SUCCESS!', response.status, response.text);
                alert('Reserva enviada por correo. Por favor, revisa tu bandeja de entrada.');
            }, function(error) {
                console.error('FAILED...', error);
                alert('Error al enviar el correo: ' + JSON.stringify(error));
            });
    }
    
    function generarIdUnico() {
        const timestamp = Date.now().toString(36);
        const randomStr = Math.random().toString(36).substring(2, 7);
        return `${timestamp}-${randomStr}`;
    }

    function generateAndDownloadPDF(reservaData) {
        const pdfDataURL = generatePDFDataURL(reservaData);
        const link = document.createElement('a');
        link.href = pdfDataURL;
        link.download = 'Reserva.pdf';
        link.click();
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
    if (restaurantAddress) {
        document.getElementById('restaurant-address').value = restaurantAddress;
    }
});

<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

require 'vendor/autoload.php';

function generatePDF($formData) {
    require('vendor/setasign/fpdf/fpdf.php');
    $pdf = new FPDF();
    $pdf->AddPage();
    $pdf->SetFont('Arial','B',16);
    $pdf->Cell(40,10,'Ticket de Reserva');
    $pdf->Ln();
    $pdf->SetFont('Arial','',12);
    foreach ($formData as $key => $value) {
        if ($key !== 'action') {
            $pdf->Cell(40,10, ucfirst($key) . ': ' . $value);
            $pdf->Ln();
        }
    }
    $pdfName = 'reserva_' . time() . '.pdf';
    $pdf->Output('F', $pdfName);
    return $pdfName;
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $formData = $_POST;
    $pdfName = generatePDF($formData);
    if ($pdfName) {
        echo json_encode(['success' => true, 'message' => 'PDF generado con éxito.', 'pdfUrl' => $pdfName]);
    } else {
        echo json_encode(['success' => false, 'message' => 'No se pudo generar el PDF.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Método de solicitud no válido.']);
}
?>
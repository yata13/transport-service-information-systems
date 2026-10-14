import 'dart:async';

import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

/// Full-screen camera QR scanner. Pops with the scanned text, or null if
/// the officer closes it.
class QrScannerScreen extends StatefulWidget {
  const QrScannerScreen({super.key});

  @override
  State<QrScannerScreen> createState() => _QrScannerScreenState();
}

class _QrScannerScreenState extends State<QrScannerScreen> {
  final MobileScannerController _controller = MobileScannerController(
    detectionSpeed: DetectionSpeed.noDuplicates,
    facing: CameraFacing.back,
    formats: const [BarcodeFormat.qrCode],
  );

  bool _handled = false;

  @override
  void dispose() {
    unawaited(_controller.dispose());
    super.dispose();
  }

  void _onDetect(BarcodeCapture capture) {
    if (_handled) return;
    for (final b in capture.barcodes) {
      final value = b.rawValue?.trim();
      if (value != null && value.isNotEmpty) {
        _handled = true;
        Navigator.of(context).pop(value);
        return;
      }
    }
  }

  Widget _buildError(BuildContext context, MobileScannerException error) {
    final String message;
    switch (error.errorCode) {
      case MobileScannerErrorCode.permissionDenied:
        message = 'የካሜራ ፈቃድ አልተሰጠም። እባክዎ በስልኩ Settings ውስጥ ለዚህ መተግበሪያ የካሜራ ፈቃድ ይፍቀዱ።\n'
            '(Camera permission denied. Allow camera access for this app in phone Settings.)';
        break;
      case MobileScannerErrorCode.unsupported:
        message = 'ይህ ስልክ የካሜራ ስካነርን አይደግፍም።\n(Camera scanning is not supported on this device.)';
        break;
      default:
        message = 'ካሜራውን መክፈት አልተቻለም።\n(Could not open the camera: '
            '${error.errorDetails?.message ?? error.errorCode.name})';
    }
    return Container(
      color: Colors.black,
      padding: const EdgeInsets.all(24),
      alignment: Alignment.center,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.no_photography, color: Colors.amber, size: 48),
          const SizedBox(height: 12),
          Text(
            message,
            textAlign: TextAlign.center,
            style: const TextStyle(color: Colors.white, fontSize: 13),
          ),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: () => unawaited(_controller.start()),
            icon: const Icon(Icons.refresh),
            label: const Text('እንደገና ሞክር (Try again)'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: const Color(0xFF0C355B),
        foregroundColor: Colors.white,
        title: const Text('QR ኮድ ቃኝ (Scan QR)', style: TextStyle(fontSize: 16)),
        actions: [
          IconButton(
            tooltip: 'Flashlight',
            icon: const Icon(Icons.flashlight_on),
            onPressed: () => unawaited(_controller.toggleTorch()),
          ),
          IconButton(
            tooltip: 'Switch camera',
            icon: const Icon(Icons.cameraswitch),
            onPressed: () => unawaited(_controller.switchCamera()),
          ),
        ],
      ),
      body: Stack(
        fit: StackFit.expand,
        children: [
          MobileScanner(
            controller: _controller,
            onDetect: _onDetect,
            errorBuilder: _buildError,
            // The widget stops the camera when the app goes to the
            // background and restarts it on return.
          ),
          IgnorePointer(
            child: Center(
              child: Container(
                width: 240,
                height: 240,
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.greenAccent, width: 3),
                  borderRadius: BorderRadius.circular(16),
                ),
              ),
            ),
          ),
          const Positioned(
            left: 16,
            right: 16,
            bottom: 32,
            child: Text(
              'የባጃጁን ፈቃድ QR ኮድ በሳጥኑ ውስጥ ያድርጉ\n(Place the QR code inside the box)',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }
}

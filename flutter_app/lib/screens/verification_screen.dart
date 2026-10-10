import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../services/supabase_service.dart';
import '../models/bajaj_vehicle.dart';
import '../widgets/verifying_progress_dialog.dart';
import 'validity_result_screen.dart';
import 'vehicle_not_found_screen.dart';

class VerificationScreen extends StatefulWidget {
  final Function(BajajVehicle vehicle)? onSelectVehicle;
  final Function(String screen)? onNavigate;

  const VerificationScreen({
    super.key,
    this.onSelectVehicle,
    this.onNavigate,
  });

  @override
  State<VerificationScreen> createState() => _VerificationScreenState();
}

class _VerificationScreenState extends State<VerificationScreen> {
  // Step 1: Scan Digital ID / QR
  // Step 2: Screen changes and asks for Plate Number Only!
  int _currentStep = 1;

  // Controllers
  final _didController = TextEditingController(text: 'DID-25-000784521');
  final _physicalPlateController = TextEditingController(text: 'AA-12345');

  String _scannedDigitalId = 'DID-25-000784521';
  BajajVehicle? _matchedVehicle;
  bool _isScannerOpen = false;

  void _goToStep2WithDigitalId(String did) async {
    final clean = did.trim();
    if (clean.isEmpty) return;

    setState(() {
      _isScannerOpen = false;
      _scannedDigitalId = clean;
    });

    // Check in database to prepare matching plate
    final found = await SupabaseService.verifyVehicle(query: clean, type: 'did');
    setState(() {
      _matchedVehicle = found;
      _physicalPlateController.text = found != null ? found.plateNumber : '3-AM-04891';
      _currentStep = 2; // CHANGE PAGE TO STEP 2 (Plate Number Only)!
    });
  }

  void _runFinalVerification() async {
    final cleanPlate = _physicalPlateController.text.trim();
    if (cleanPlate.isEmpty) return;

    // Show Progress Dialog
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => VerifyingProgressDialog(
        queryValue: _scannedDigitalId,
        queryType: 'did',
        onFinished: () async {
          Navigator.pop(context); // close progress dialog

          // Query Supabase / Local
          final vehicle = await SupabaseService.verifyVehicle(
            query: _scannedDigitalId,
            type: 'did',
          );

          if (mounted) {
            if (vehicle != null) {
              // Real vehicle found: compare registered plate vs entered physical plate
              final inputPlateNorm = cleanPlate.toUpperCase().replaceAll(RegExp(r'[^A-Z0-9]'), '');
              final regPlateNorm = vehicle.plateNumber.toUpperCase().replaceAll(RegExp(r'[^A-Z0-9]'), '');
              final isClashOrMismatch = (inputPlateNorm != regPlateNorm);

              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => ValidityResultScreen(
                    vehicle: vehicle,
                    onNavigate: widget.onNavigate,
                    physicalPlateChecked: cleanPlate.toUpperCase(),
                    isPlateMismatch: isClashOrMismatch,
                  ),
                ),
              );
            } else {
              // Not found
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => VehicleNotFoundScreen(
                    searchedQuery: _scannedDigitalId,
                    queryType: 'did',
                  ),
                ),
              );
            }
          }
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF0C355B), Color(0xFF164472)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.blue.withOpacity(0.15),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Row(
              children: [
                Container(
                  width: 38,
                  height: 38,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: Colors.amber.shade400, width: 1.5),
                  ),
                  child: Center(
                    child: Text(
                      '$_currentStep',
                      style: const TextStyle(
                        color: Colors.amber,
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _currentStep == 1
                            ? 'ደረጃ 1፡ ዲጂታል መታወቂያ / QR ኮድ'
                            : 'ደረጃ 2፡ የሰሌዳ ቁጥር (ታርጋ) ማረጋገጫ',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        _currentStep == 1
                            ? 'የባጃጁን ዲጂታል መታወቂያ ወይም ፈቃድ QR ኮድ ይቃኙ'
                            : 'በተሽከርካሪው ላይ የሚታየውን ታርጋ ብቻ ያስገቡ',
                        style: const TextStyle(color: Colors.white70, fontSize: 10),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // =========================================================================
          // STEP 1: ONLY DIGITAL ID / QR SCAN (Plate and VIN tabs removed!)
          // =========================================================================
          if (_currentStep == 1) ...[
            Card(
              elevation: 2,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Info Banner
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: Colors.blue.shade50,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: Colors.blue.shade200),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.qr_code, color: Color(0xFF0C355B), size: 20),
                          SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              'የዲጂታል መታወቂያ / QR ኮድ ብቻ በመቃኘት ፍተሻ ይጀምሩ',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF0C355B),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 14),

                    // Live Camera Scanner Toggle
                    ElevatedButton.icon(
                      onPressed: () {
                        setState(() => _isScannerOpen = !_isScannerOpen);
                      },
                      icon: Icon(_isScannerOpen ? Icons.videocam_off : Icons.camera_alt, size: 18),
                      label: Text(
                        _isScannerOpen
                            ? 'ካሜራ ዝጋ (Close Camera)'
                            : 'የካሜራ ስካነር ክፈት (Live Camera QR Scan)',
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF185A9D),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                    if (_isScannerOpen) ...[
                      const SizedBox(height: 10),
                      SizedBox(
                        height: 140,
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: MobileScanner(
                            onDetect: (capture) {
                              final barcodes = capture.barcodes;
                              for (final b in barcodes) {
                                if (b.rawValue != null) {
                                  _goToStep2WithDigitalId(b.rawValue!);
                                  break;
                                }
                              }
                            },
                          ),
                        ),
                      ),
                    ],
                    const SizedBox(height: 16),
                    const Divider(height: 1),
                    const SizedBox(height: 14),

                    // Manual DID Input
                    const Text(
                      'የዲጂታል መታወቂያ ቁጥር (Digital ID / QR Value):',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _didController,
                      decoration: InputDecoration(
                        hintText: 'ለምሳሌ፡ DID-25-000784521',
                        prefixIcon: const Icon(Icons.qr_code_2),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Demo Buttons
                    const Text(
                      'ፈጣን የሙከራ ዲጂታል መታወቂያዎች (Demo QR):',
                      style: TextStyle(fontSize: 10, color: Colors.grey, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            onPressed: () {
                              _didController.text = 'DID-25-000784521';
                              _goToStep2WithDigitalId('DID-25-000784521');
                            },
                            child: const Text('DID-25 (AA-12345)', style: TextStyle(fontSize: 10)),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: OutlinedButton(
                            onPressed: () {
                              _didController.text = 'DID-GD-0489120';
                              _goToStep2WithDigitalId('DID-GD-0489120');
                            },
                            child: const Text('DID-GD (3-AM-04891)', style: TextStyle(fontSize: 10)),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    // Step 1 Next Button
                    ElevatedButton.icon(
                      onPressed: () => _goToStep2WithDigitalId(_didController.text),
                      icon: const Icon(Icons.arrow_forward, size: 18),
                      label: const Text('ቀጣይ፡ ታርጋ አረጋግጥ (Next: Enter Plate)'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF0C355B),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ] else ...[
            // =========================================================================
            // STEP 2: SCREEN CHANGES AND ASKS FOR PLATE NUMBER ONLY!
            // =========================================================================
            Card(
              elevation: 2,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Scanned DID Confirmation Chip
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.green.shade50,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: Colors.green.shade200),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.check_circle, color: Colors.green, size: 20),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'የተቃኘው ዲጂታል መታወቂያ (Scanned DID):',
                                  style: TextStyle(fontSize: 10, color: Colors.grey),
                                ),
                                Text(
                                  _scannedDigitalId,
                                  style: const TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF0C355B),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          TextButton(
                            onPressed: () => setState(() => _currentStep = 1),
                            child: const Text('ቀይር', style: TextStyle(fontSize: 11)),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 14),

                    // Warning instruction
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: Colors.amber.shade50,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: Colors.amber.shade300),
                      ),
                      child: Row(
                        children: [
                          Icon(Icons.info_outline, color: Colors.amber.shade900, size: 18),
                          const SizedBox(width: 8),
                          const Expanded(
                            child: Text(
                              'አሁን በተሽከርካሪው ላይ የሚታየውን ታርጋ ብቻ ያስገቡ። ሰሌዳዎቹ የተለያዩ ከሆኑ ግጭት (Clash) ይፈጠራል::',
                              style: TextStyle(fontSize: 10, color: Colors.black87),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Physical Plate Number Only Input
                    const Text(
                      'በተሽከርካሪው ላይ የሚታየው የሰሌዳ ቁጥር (ታርጋ) ብቻ:',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _physicalPlateController,
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                      decoration: InputDecoration(
                        hintText: 'ለምሳሌ፡ AA-12345 ወይም 3-AM-04891',
                        prefixIcon: const Icon(Icons.directions_car),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                    const SizedBox(height: 14),

                    // Quick Match vs Clash Test Buttons
                    const Text(
                      'የሙከራ አዝራሮች (Test Match vs Clash):',
                      style: TextStyle(fontSize: 10, color: Colors.grey, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        // Match button
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: () {
                              final p = _matchedVehicle != null ? _matchedVehicle!.plateNumber : 'AA-12345';
                              _physicalPlateController.text = p;
                            },
                            icon: const Icon(Icons.check, size: 14, color: Colors.green),
                            label: const Text('ተዛማጅ ሰሌዳ (Match)', style: TextStyle(fontSize: 10, color: Colors.green)),
                          ),
                        ),
                        const SizedBox(width: 8),
                        // Clash button
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: () {
                              final p = (_matchedVehicle != null && _matchedVehicle!.plateNumber == 'AA-12345')
                                  ? '3-AM-04891'
                                  : 'AA-12345';
                              _physicalPlateController.text = p;
                            },
                            icon: const Icon(Icons.warning, size: 14, color: Colors.red),
                            label: const Text('የተለየ ታርጋ (Clash)', style: TextStyle(fontSize: 10, color: Colors.red)),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),

                    // Final Inspection Button
                    ElevatedButton.icon(
                      onPressed: _runFinalVerification,
                      icon: const Icon(Icons.compare_arrows, size: 18),
                      label: const Text('አመሳክር እና ፍተሻ ጀምር (Start Clash & Match Inspection)'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF0C355B),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                    const SizedBox(height: 10),

                    // Back to Step 1 Button
                    OutlinedButton.icon(
                      onPressed: () => setState(() => _currentStep = 1),
                      icon: const Icon(Icons.arrow_back, size: 16),
                      label: const Text('ወደ ደረጃ 1 ተመለስ (Back to Scan)'),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

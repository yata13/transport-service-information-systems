import 'package:flutter/material.dart';
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
  final _didController = TextEditingController();
  final _physicalPlateController = TextEditingController();

  String _scannedDigitalId = '';
  BajajVehicle? _matchedVehicle;
  bool _isLookingUp = false;
  List<BajajVehicle> _recentVehicles = [];

  @override
  void initState() {
    super.initState();
    SupabaseService.getAllVehicles().then((list) {
      if (mounted) setState(() => _recentVehicles = list.take(2).toList());
    });
  }

  @override
  void dispose() {
    _didController.dispose();
    _physicalPlateController.dispose();
    super.dispose();
  }

  void _goToStep2WithDigitalId(String did) async {
    final clean = did.trim();
    // Guard against double taps: look up once.
    if (clean.isEmpty || _isLookingUp) return;
    _isLookingUp = true;

    setState(() {
      _scannedDigitalId = clean.split('|').first.trim();
    });

    final found = await SupabaseService.verifyVehicle(query: clean, type: 'did');
    _isLookingUp = false;
    if (!mounted) return;
    setState(() {
      _matchedVehicle = found;
      if (found != null) _scannedDigitalId = found.digitalId;
      // The officer must type the plate physically seen on the vehicle;
      // pre-filling it would make every check pass.
      _physicalPlateController.clear();
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

              SupabaseService.logInspection(
                digitalId: vehicle.digitalId,
                plateChecked: cleanPlate.toUpperCase(),
                registeredPlate: vehicle.plateNumber,
                result: isClashOrMismatch
                    ? 'MISMATCH'
                    : (vehicle.isBlacklisted || vehicle.status == 'SUSPENDED' || vehicle.status == 'ILLEGAL')
                        ? 'SUSPENDED'
                        : vehicle.status == 'EXPIRED'
                            ? 'EXPIRED'
                            : 'VALID',
              );

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
              SupabaseService.logInspection(
                digitalId: _scannedDigitalId,
                plateChecked: cleanPlate.toUpperCase(),
                result: 'NOT_FOUND',
              );
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
                              'የዲጂታል መታወቂያ ቁጥር በማስገባት ፍተሻ ይጀምሩ',
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

                    // Manual DID Input
                    const Text(
                      'የዲጂታል መታወቂያ ቁጥር (Digital ID / QR Value):',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _didController,
                      decoration: InputDecoration(
                        hintText: 'ለምሳሌ፡ DID-GD-0489120',
                        prefixIcon: const Icon(Icons.qr_code_2),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Recently registered vehicles (from the live registry)
                    if (_recentVehicles.isNotEmpty) ...[
                      const Text(
                        'በቅርብ የተመዘገቡ (Recently registered):',
                        style: TextStyle(fontSize: 10, color: Colors.grey, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 6),
                      Wrap(
                        spacing: 8,
                        runSpacing: 6,
                        children: _recentVehicles
                            .map((v) => OutlinedButton(
                                  onPressed: () {
                                    _didController.text = v.digitalId;
                                    _goToStep2WithDigitalId(v.digitalId);
                                  },
                                  child: Text('${v.digitalId} (${v.plateNumber})', style: const TextStyle(fontSize: 10)),
                                ))
                            .toList(),
                      ),
                      const SizedBox(height: 16),
                    ],

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

                    if (_matchedVehicle == null) ...[
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: Colors.red.shade50,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.red.shade300),
                        ),
                        child: Text(
                          'ይህ መታወቂያ በመዝገቡ ውስጥ የለም (ID not found in registry)',
                          style: TextStyle(color: Colors.red.shade900, fontSize: 11, fontWeight: FontWeight.bold),
                        ),
                      ),
                      const SizedBox(height: 14),
                    ],
                    const SizedBox(height: 6),

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
                      label: const Text('ወደ ደረጃ 1 ተመለስ (Back to Step 1)'),
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

import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../services/supabase_service.dart';
import '../models/bajaj_vehicle.dart';
import '../widgets/verifying_progress_dialog.dart';
import 'validity_result_screen.dart';

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

class _VerificationScreenState extends State<VerificationScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _didController = TextEditingController(text: 'DID-25-000784521');
  final _plateController = TextEditingController(text: 'AA-12345');
  final _vinController = TextEditingController(text: 'MBN12345678912345');

  bool _isScannerOpen = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  void _runVerification(String query, String type) async {
    if (query.trim().isEmpty) return;

    // Show Progress Dialog with 3 steps
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => VerifyingProgressDialog(
        queryValue: query,
        queryType: type,
        onFinished: () async {
          Navigator.pop(context); // close progress dialog

          // Query Supabase / Local
          final vehicle = await SupabaseService.verifyVehicle(query: query, type: type);

          if (mounted) {
            final targetVehicle = vehicle ??
                BajajVehicle(
                  id: 'illegal-1',
                  digitalId: query,
                  plateNumber: type == 'plate' ? query : 'ያልታወቀ (Unknown)',
                  vin: type == 'vin' ? query : 'VIN-UNREGISTERED',
                  vehicleType: 'Bajaj (ባጃጅ)',
                  bajajModel: 'ያልተመዘገበ',
                  bajajAssociation: 'በጎንደር ያልተመዘገበ',
                  color: 'ያልታወቀ',
                  owner: 'ያልታወቀ ግለሰብ',
                  ownerPhone: '-',
                  driverName: 'ያልተመዘገበ',
                  driverPhone: '-',
                  driverPhoto: '',
                  kebele: 'ያልታወቀ',
                  address: 'በጎንደር ከተማ መዝገብ ውስጥ የለም',
                  permitNo: 'NO-PERMIT',
                  issueDate: '2025-01-01',
                  expiryDate: '2025-01-01',
                  authorizedArea: 'ያልተፈቀደ (Illegal)',
                  status: 'ILLEGAL',
                  isBlacklisted: true,
                  blacklistReason: 'በጎንደር ትራንስፖርት ዳታቤዝ ውስጥ ያልተገኘ ህገወጥ ተሽከርካሪ',
                  qrCodeValue: query,
                  registeredCity: 'Gondar / ጎንደር',
                );

            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => ValidityResultScreen(
                  vehicle: targetVehicle,
                  onNavigate: widget.onNavigate,
                ),
              ),
            );
          }
        },
      ),
    );
  }

  Widget _buildQuickDemoCard({
    required String titleAm,
    required String subtitle,
    required Color color,
    required String query,
    required String type,
  }) {
    return Card(
      elevation: 1,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10),
        side: BorderSide(color: color.withOpacity(0.4)),
      ),
      child: InkWell(
        onTap: () => _runVerification(query, type),
        borderRadius: BorderRadius.circular(10),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 10,
                height: 10,
                decoration: BoxDecoration(color: color, shape: BoxShape.circle),
              ),
              const SizedBox(width: 8),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    titleAm,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11),
                  ),
                  Text(
                    subtitle,
                    style: const TextStyle(fontSize: 9, color: Colors.grey),
                  ),
                ],
              ),
            ],
          ),
        ),
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
            child: const Row(
              children: [
                Icon(LucideIcons.shieldCheck, color: Colors.amber, size: 32),
                SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'የባጃጅ ፈቃድ ማረጋገጫ (Verification)',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        'በQR ኮድ፣ በዲጂታል መታወቂያ ወይም በሰሌዳ ቁጥር ፈትሽ',
                        style: TextStyle(color: Colors.white70, fontSize: 10),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),

          // Quick Demo Test Jumps
          const Text(
            'ፈጣን የሙከራ ፍተሻዎች (Demo Shortcuts):',
            style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF0C355B)),
          ),
          const SizedBox(height: 6),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _buildQuickDemoCard(
                  titleAm: '1. ሕጋዊ ፈቃድ (Valid)',
                  subtitle: 'ሰሌዳ: AA-12345',
                  color: Colors.green,
                  query: 'AA-12345',
                  type: 'plate',
                ),
                const SizedBox(width: 8),
                _buildQuickDemoCard(
                  titleAm: '2. ጊዜው ያለፈበት (Expired)',
                  subtitle: 'ሰሌዳ: 3-AM-99999',
                  color: Colors.amber.shade800,
                  query: '3-AM-99999',
                  type: 'plate',
                ),
                const SizedBox(width: 8),
                _buildQuickDemoCard(
                  titleAm: '3. ያልተመዘገበ (Illegal)',
                  subtitle: 'ሰሌዳ: 3-AM-00000',
                  color: Colors.red,
                  query: '3-AM-00000',
                  type: 'plate',
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Verification Tabs Container
          Card(
            elevation: 2,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            clipBehavior: Clip.antiAlias,
            child: Column(
              children: [
                Container(
                  color: const Color(0xFF0C355B),
                  child: TabBar(
                    controller: _tabController,
                    indicatorColor: Colors.amber,
                    indicatorWeight: 3,
                    labelColor: Colors.white,
                    unselectedLabelColor: Colors.white60,
                    tabs: const [
                      Tab(text: 'QR / DID'),
                      Tab(text: 'ሰሌዳ ቁጥር'),
                      Tab(text: 'ቻሲስ (VIN)'),
                    ],
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: SizedBox(
                    height: 310,
                    child: TabBarView(
                      controller: _tabController,
                      children: [
                        // Tab 1: QR & DID
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            const Text(
                              'ዲጂታል መታወቂያ (Digital ID)',
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                            ),
                            const SizedBox(height: 8),
                            TextField(
                              controller: _didController,
                              decoration: InputDecoration(
                                hintText: 'DID-25-000784521',
                                prefixIcon: const Icon(LucideIcons.scanLine),
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                              ),
                            ),
                            const SizedBox(height: 10),
                            ElevatedButton.icon(
                              onPressed: () => _runVerification(_didController.text, 'did'),
                              icon: const Icon(LucideIcons.search, size: 18),
                              label: const Text('አረጋግጥ (Verify ID)'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF0C355B),
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(vertical: 12),
                              ),
                            ),
                            const SizedBox(height: 14),
                            const Divider(height: 1),
                            const SizedBox(height: 12),

                            // Camera Scanner Toggle
                            ElevatedButton.icon(
                              onPressed: () {
                                setState(() => _isScannerOpen = !_isScannerOpen);
                              },
                              icon: Icon(_isScannerOpen ? LucideIcons.cameraOff : LucideIcons.camera, size: 18),
                              label: Text(_isScannerOpen ? 'ካሜራ ዝጋ (Close Camera)' : 'የካሜራ ስካነር ክፈት (Live QR Scan)'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF185A9D),
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(vertical: 12),
                              ),
                            ),
                            if (_isScannerOpen) ...[
                              const SizedBox(height: 10),
                              SizedBox(
                                height: 100,
                                child: ClipRRect(
                                  borderRadius: BorderRadius.circular(10),
                                  child: MobileScanner(
                                    onDetect: (capture) {
                                      final barcodes = capture.barcodes;
                                      for (final b in barcodes) {
                                        if (b.rawValue != null) {
                                          setState(() => _isScannerOpen = false);
                                          _runVerification(b.rawValue!, 'qr');
                                          break;
                                        }
                                      }
                                    },
                                  ),
                                ),
                              ),
                            ],
                          ],
                        ),

                        // Tab 2: Plate
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            const Text(
                              'የሰሌዳ ቁጥር (Plate Number)',
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                            ),
                            const SizedBox(height: 8),
                            TextField(
                              controller: _plateController,
                              decoration: InputDecoration(
                                hintText: 'ለምሳሌ፡ AA-12345 ወይም 3-AM-04891',
                                prefixIcon: const Icon(LucideIcons.car),
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                              ),
                            ),
                            const SizedBox(height: 14),
                            ElevatedButton.icon(
                              onPressed: () => _runVerification(_plateController.text, 'plate'),
                              icon: const Icon(LucideIcons.search, size: 18),
                              label: const Text('በሰሌዳ ቁጥር ፈትሽ (Search Plate)'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF0C355B),
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(vertical: 14),
                              ),
                            ),
                          ],
                        ),

                        // Tab 3: VIN
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            const Text(
                              'VIN / ቻሲስ ቁጥር (Chassis Number)',
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                            ),
                            const SizedBox(height: 8),
                            TextField(
                              controller: _vinController,
                              decoration: InputDecoration(
                                hintText: 'MBN12345678912345',
                                prefixIcon: const Icon(LucideIcons.binary),
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                              ),
                            ),
                            const SizedBox(height: 14),
                            ElevatedButton.icon(
                              onPressed: () => _runVerification(_vinController.text, 'vin'),
                              icon: const Icon(LucideIcons.search, size: 18),
                              label: const Text('በቻሲስ ፈትሽ (Search Chassis)'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF0C355B),
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(vertical: 14),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

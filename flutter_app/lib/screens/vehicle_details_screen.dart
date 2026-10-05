import 'package:flutter/material.dart';
import '../models/bajaj_vehicle.dart';
import '../widgets/pdf_permit_modal.dart';
import 'violation_report_screen.dart';

class VehicleDetailsScreen extends StatelessWidget {
  final BajajVehicle vehicle;

  const VehicleDetailsScreen({super.key, required this.vehicle});

  Widget _buildRow(String labelAm, String labelEn, String value, {Color? valueColor}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 9.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(labelAm, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12)),
              Text(labelEn, style: const TextStyle(color: Colors.grey, fontSize: 10)),
            ],
          ),
          const SizedBox(width: 12),
          Flexible(
            child: Text(
              value,
              textAlign: TextAlign.end,
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 12,
                color: valueColor ?? const Color(0xFF0C355B),
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final primaryPhone =
        vehicle.driverPhone.isNotEmpty && vehicle.driverPhone != '-' ? vehicle.driverPhone : vehicle.ownerPhone;

    return Scaffold(
      backgroundColor: const Color(0xFFF4F7FB),
      appBar: AppBar(
        title: const Text('የተሽከርካሪ ሙሉ መረጃ (Vehicle Details)'),
        backgroundColor: const Color(0xFF0C355B),
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            // Top Identity Card
            Card(
              elevation: 2,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Row(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: vehicle.driverPhoto.isNotEmpty
                          ? Image.network(
                              vehicle.driverPhoto,
                              width: 70,
                              height: 70,
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) => Container(
                                width: 70,
                                height: 70,
                                color: Colors.grey.shade200,
                                child: const Icon(Icons.person, size: 30, color: Colors.grey),
                              ),
                            )
                          : Container(
                              width: 70,
                              height: 70,
                              color: Colors.grey.shade200,
                              child: const Icon(Icons.person, size: 30, color: Colors.grey),
                            ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            vehicle.driverName.isNotEmpty && vehicle.driverName != 'ያልተመዘገበ'
                                ? vehicle.driverName
                                : vehicle.owner,
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                          ),
                          const SizedBox(height: 4),
                          // Plain text phone (non-clickable)
                          Row(
                            children: [
                              const Icon(Icons.phone, size: 12, color: Color(0xFF0C355B)),
                              const SizedBox(width: 4),
                              SelectableText(
                                primaryPhone,
                                style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 11),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              const Icon(Icons.location_on, size: 12, color: Colors.red),
                              const SizedBox(width: 4),
                              Expanded(
                                child: Text(
                                  '${vehicle.kebele} · ${vehicle.address}',
                                  style: const TextStyle(color: Colors.grey, fontSize: 10),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 14),

            // 15-attribute Technical Details Table
            Card(
              elevation: 2,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    _buildRow('ዲጂታል መታወቂያ', 'Digital ID', vehicle.digitalId),
                    const Divider(height: 1),
                    _buildRow('የሰሌዳ ቁጥር', 'Plate Number', vehicle.plateNumber),
                    const Divider(height: 1),
                    _buildRow('VIN / ቻሲስ ቁጥር', 'VIN / Chassis', vehicle.vin),
                    const Divider(height: 1),
                    _buildRow('የተሽከርካሪ አይነት', 'Vehicle Type', vehicle.vehicleType),
                    const Divider(height: 1),
                    _buildRow('ሞዴል ተሽከርካሪ', 'Bajaj Model', vehicle.bajajModel),
                    const Divider(height: 1),
                    _buildRow('የባጃጅ ማህበር', 'Bajaj Association', vehicle.bajajAssociation),
                    const Divider(height: 1),
                    _buildRow('ቀለም', 'Color', vehicle.color),
                    const Divider(height: 1),
                    _buildRow('የባለቤት ስም', 'Owner Name', vehicle.owner),
                    const Divider(height: 1),
                    _buildRow('የፈቃድ ቁጥር', 'Permit Number', vehicle.permitNo),
                    const Divider(height: 1),
                    _buildRow('የተሰጠበት ቀን', 'Issue Date', vehicle.issueDate),
                    const Divider(height: 1),
                    _buildRow('የሚያበቃበት ቀን', 'Expiry Date', vehicle.expiryDate),
                    const Divider(height: 1),
                    _buildRow(
                      'የተፈቀደ የጉዞ ዞን',
                      'Authorized Route',
                      vehicle.authorizedArea,
                      valueColor: Colors.blue.shade900,
                    ),
                    const Divider(height: 1),
                    _buildRow(
                      'የፈቃድ ሁኔታ',
                      'Status',
                      vehicle.status,
                      valueColor: vehicle.status == 'ACTIVE'
                          ? Colors.green.shade700
                          : vehicle.status == 'EXPIRED'
                              ? Colors.amber.shade800
                              : Colors.red,
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Bottom Actions: PDF Modal & Ticket
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () {
                      showDialog(
                        context: context,
                        builder: (_) => PdfPermitModal(vehicle: vehicle),
                      );
                    },
                    icon: const Icon(Icons.description, size: 16),
                    label: const Text('PDF ፈቃድ እይ'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF0C355B),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => ViolationReportScreen(vehicle: vehicle),
                        ),
                      );
                    },
                    icon: const Icon(Icons.warning, size: 16),
                    label: const Text('የጥሰት ቅጣት ፃፍ'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.red.shade700,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

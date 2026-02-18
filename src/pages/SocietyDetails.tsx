import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
    Building,
    Search,
    Eye,
    Edit,
    Trash2,
    Loader2,
    FileText,
    X,
    Calendar,
    Scale,
    Printer
} from 'lucide-react';


interface SocietyStats {
    name: string;
    count: number;
}

export function SocietyDetails() {
    const [stats, setStats] = useState<SocietyStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSociety, setSelectedSociety] = useState<string | null>(null);
    const [societyCases, setSocietyCases] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loadingCases, setLoadingCases] = useState(false);

    useEffect(() => {
        fetchSocieties();
    }, []);

    const fetchSocieties = async () => {
        setLoading(true);
        try {
            // Fetch all cases to aggregate society data
            // Note: For large datasets, this should be done via an RPC or a View on the backend
            const { data, error } = await supabase
                .from('cases')
                .select('society');

            if (error) {
                console.error('Error fetching cases:', error);
                return;
            }

            if (data) {
                // Aggregate counts
                const societyCounts: Record<string, number> = {};

                data.forEach(item => {
                    const societyName = item.society?.trim();
                    if (societyName) {
                        societyCounts[societyName] = (societyCounts[societyName] || 0) + 1;
                    }
                });

                // Convert to array
                const statsArray = Object.entries(societyCounts).map(([name, count]) => ({
                    name,
                    count
                })).sort((a, b) => a.name.localeCompare(b.name));

                setStats(statsArray);
            }
        } catch (err) {
            console.error('Unexpected error:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredStats = stats.filter(stat =>
        stat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleView = async (name: string) => {
        setSelectedSociety(name);
        setIsModalOpen(true);
        setLoadingCases(true);
        try {
            const { data, error } = await supabase
                .from('cases')
                .select('*')
                .eq('society', name)
                .order('case_year', { ascending: false }); // Order by year by default

            if (data) {
                setSocietyCases(data);
            }
        } catch (error) {
            console.error('Error fetching society cases:', error);
        } finally {
            setLoadingCases(false);
        }
    };

    const handleEdit = (name: string) => {
        console.log('Edit society:', name);
        // Open modal to rename society
    };

    const getStatusColor = (status: string) => {
        const s = status?.toLowerCase() || '';
        if (s === 'active') return '#1e40af'; // Blue
        if (s === 'closed' || s === 'disposed') return '#059669'; // Green
        return '#6b7280'; // Gray
    };

    const getStatusBg = (status: string) => {
        const s = status?.toLowerCase() || '';
        if (s === 'active') return '#dbeafe';
        if (s === 'closed' || s === 'disposed') return '#d1fae5';
        return '#f3f4f6';
    };

    const handlePrintAll = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            const reportId = `KC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}-SR`;

            printWindow.document.write(`
                <html>
                    <head>
                        <title>Official Case Summary Report - ${selectedSociety}</title>
                        <style>
                            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                            body { font-family: 'Inter', sans-serif; padding: 40px; color: #111827; max-width: 1000px; margin: 0 auto; position: relative; }
                            
                            /* Header */
                            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
                            .logo-section h1 { font-size: 24px; font-weight: 800; color: #1e40af; margin: 0; letter-spacing: -0.5px; text-transform: uppercase; }
                            .logo-section p { font-size: 10px; color: #6b7280; letter-spacing: 2px; margin: 5px 0 0 0; text-transform: uppercase; font-weight: 600; }
                            
                            .address-section { text-align: right; font-size: 9px; color: #374151; line-height: 1.4; }
                            
                            .divider { height: 2px; background: #1e40af; margin: 20px 0 40px 0; }
                            
                            /* Title Area */
                            .report-title { font-size: 28px; font-weight: 700; color: #1e40af; margin-bottom: 30px; letter-spacing: -0.5px; }
                            
                            /* Metadata Bar */
                            .meta-bar { background: #f9fafb; padding: 20px; display: flex; justify-content: space-between; border-radius: 4px; margin-bottom: 40px; border: 1px solid #f3f4f6; }
                            .meta-item { display: flex; flex-col; flex-direction: column; }
                            .meta-label { font-size: 9px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
                            .meta-value { font-size: 13px; font-weight: 600; color: #111827; }
                            .badge-confidential { background: #fecaca; color: #991b1b; padding: 2px 8px; border-radius: 2px; font-size: 10px; font-weight: 700; display: inline-block; }
                            
                            /* Executive Overview */
                            .section-title { font-size: 14px; font-weight: 700; color: #111827; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
                            .section-text { font-size: 11px; color: #4b5563; line-height: 1.6; margin-bottom: 30px; text-align: justify; }
                            
                            /* Table */
                            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
                            th { text-align: left; color: #6b7280; font-weight: 700; padding: 12px 16px; border-bottom: 2px solid #f3f4f6; text-transform: uppercase; font-size: 9px; letter-spacing: 0.5px; }
                            td { padding: 16px; border-bottom: 1px solid #f3f4f6; color: #1f2937; vertical-align: middle; }
                            tr:last-child td { border-bottom: none; }
                            
                            .case-ref { font-weight: 600; color: #1d4ed8; }
                            .status-pill { padding: 4px 10px; border-radius: 12px; font-size: 9px; font-weight: 700; text-transform: uppercase; display: inline-block; min-width: 60px; text-align: center; }
                            
                            /* Footer */
                            .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: flex-end; }
                            .footer-left { font-size: 8px; color: #9ca3af; line-height: 1.5; font-style: italic; max-width: 60%; }
                            .footer-right { text-align: right; }
                            .signature-line { width: 200px; border-top: 1px solid #9ca3af; padding-top: 8px; margin-bottom: 4px; }
                            .signature-label { font-size: 9px; font-weight: 700; color: #374151; text-transform: uppercase; }
                            .page-num { font-size: 9px; color: #9ca3af; margin-top: 10px; text-align: right; letter-spacing: 1px; }
                            
                            /* Watermark */
                            .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 120px; color: rgba(243, 244, 246, 0.6); font-weight: 800; z-index: -1; pointer-events: none; letter-spacing: 10px; }

                            @media print {
                                body { -webkit-print-color-adjust: exact; }
                                .no-print { display: none; }
                            }
                        </style>
                    </head>
                    <body>
                        <div class="watermark">CONFIDENTIAL</div>
                        
                        <div class="header">
                            <div class="logo-section">
                                <h1>Kurup & Co.</h1>
                                <p>Legal Chambers & Associates</p>
                            </div>
                            <div class="address-section">
                                Level 24, Legal Tower, Financial District<br>
                                Kochi, Kerala, 682031, India<br>
                                T: +91 484-2274 9292<br>
                                E: office@kurupco.com
                            </div>
                        </div>
                        
                        <div class="divider"></div>
                        
                        <div class="report-title">OFFICIAL CASE SUMMARY REPORT</div>
                        
                        <div class="meta-bar">
                            <div class="meta-item">
                                <span class="meta-label">Report ID</span>
                                <span class="meta-value">${reportId}</span>
                            </div>
                            <div class="meta-item">
                                <span class="meta-label">Date Generated</span>
                                <span class="meta-value">${today}</span>
                            </div>
                            <div class="meta-item">
                                <span class="meta-label">Attorney In Charge</span>
                                <span class="meta-value">Adv. S. Kurup</span>
                            </div>
                            <div class="meta-item">
                                <span class="meta-label">Security Level</span>
                                <span class="badge-confidential">HIGHLY CONFIDENTIAL</span>
                            </div>
                        </div>
                        
                        <div class="section-title">1. Executive Overview</div>
                        <div class="section-text">
                            This document serves as a comprehensive summary of the ongoing litigation and legal counsel provided to the client 
                            <strong>${selectedSociety}</strong>. All matters listed herein fall under attorney-client privilege and are protected by non-disclosure agreements.
                            The primary focus of current activities involves commercial dispute resolution, interim order compliance, and high-stakes litigation defense. 
                            Recent outcomes indicate a favorable trajectory for primary case filings.
                        </div>
                        
                        <div class="section-title">2. Active Ledger & Matter Status</div>
                        
                        <table>
                            <thead>
                                <tr>
                                    <th>Case Ref</th>
                                    <th>Subject Matter</th>
                                    <th>Year</th>
                                    <th>Category</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${societyCases.map(c => `
                                    <tr>
                                        <td class="case-ref">${c.case_no || 'N/A'}</td>
                                        <td style="font-weight: 500;">${c.name}</td>
                                        <td>${c.case_year}</td>
                                        <td>${c.category || '-'}</td>
                                        <td>
                                            <span class="status-pill" style="background: ${getStatusBg(c.status)}; color: ${getStatusColor(c.status)}">
                                                ${c.status || 'UNKNOWN'}
                                            </span>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        
                        <div class="footer">
                            <div class="footer-left">
                                Firm Registration: KC/2004/9910 • Bar Council ID: 485/2024<br>
                                This report is strictly for the intended recipient. Unauthorized reproduction, distribution, or sharing is prohibited under the Legal Profession Act 1976.
                            </div>
                            <div class="footer-right">
                                <div class="signature-line"></div>
                                <div class="signature-label">Managing Partner Signature</div>
                                <div class="page-num">PAGE 01 OF 01</div>
                            </div>
                        </div>

                        <script>
                            window.onload = function() { window.print(); }
                        </script>
                    </body>
                </html>
            `);
            printWindow.document.close();
        }
    };

    const handlePrintCase = (caseItem: any) => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            const reportId = `KC-CASE-${caseItem.case_year}-${Math.floor(1000 + Math.random() * 9000)}`;

            printWindow.document.write(`
                <html>
                    <head>
                        <title>Official Case Detail - ${caseItem.case_no}</title>
                        <style>
                            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                            body { font-family: 'Inter', sans-serif; padding: 40px; color: #111827; max-width: 1000px; margin: 0 auto; position: relative; }
                            
                            /* Header */
                            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
                            .logo-section h1 { font-size: 24px; font-weight: 800; color: #1e40af; margin: 0; letter-spacing: -0.5px; text-transform: uppercase; }
                            .logo-section p { font-size: 10px; color: #6b7280; letter-spacing: 2px; margin: 5px 0 0 0; text-transform: uppercase; font-weight: 600; }
                            
                            .address-section { text-align: right; font-size: 9px; color: #374151; line-height: 1.4; }
                            
                            .divider { height: 2px; background: #1e40af; margin: 20px 0 40px 0; }
                            
                            /* Title Area */
                            .report-title { font-size: 28px; font-weight: 700; color: #1e40af; margin-bottom: 30px; letter-spacing: -0.5px; }
                            
                            /* Metadata Bar */
                            .meta-bar { background: #f9fafb; padding: 20px; display: flex; justify-content: space-between; border-radius: 4px; margin-bottom: 40px; border: 1px solid #f3f4f6; }
                            .meta-item { display: flex; flex-col; flex-direction: column; }
                            .meta-label { font-size: 9px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
                            .meta-value { font-size: 13px; font-weight: 600; color: #111827; }
                            .badge-confidential { background: #fecaca; color: #991b1b; padding: 2px 8px; border-radius: 2px; font-size: 10px; font-weight: 700; display: inline-block; }
                            
                            /* Section Titles */
                            .section-title { font-size: 14px; font-weight: 700; color: #111827; margin-bottom: 15px; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-top: 30px; }
                            
                            /* Data Grid */
                            .data-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 20px; }
                            .data-item { margin-bottom: 10px; }
                            .data-label { font-size: 10px; color: #6b7280; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
                            .data-value { font-size: 14px; color: #1f2937; font-weight: 500; border: 1px solid #e5e7eb; padding: 10px; border-radius: 6px; background: #fff; }
                            
                            .full-width { grid-column: span 2; }
                            
                            .status-badge { display: inline-block; padding: 4px 12px; border-radius: 100px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
                            
                            /* Footer */
                            .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: flex-end; }
                            .footer-left { font-size: 8px; color: #9ca3af; line-height: 1.5; font-style: italic; max-width: 60%; }
                            .footer-right { text-align: right; }
                            .signature-line { width: 200px; border-top: 1px solid #9ca3af; padding-top: 8px; margin-bottom: 4px; }
                            .signature-label { font-size: 9px; font-weight: 700; color: #374151; text-transform: uppercase; }
                            .page-num { font-size: 9px; color: #9ca3af; margin-top: 10px; text-align: right; letter-spacing: 1px; }
                            
                            /* Watermark */
                            .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 120px; color: rgba(243, 244, 246, 0.6); font-weight: 800; z-index: -1; pointer-events: none; letter-spacing: 10px; }

                            @media print {
                                body { -webkit-print-color-adjust: exact; }
                            }
                        </style>
                    </head>
                    <body>
                        <div class="watermark">CONFIDENTIAL</div>
                        
                        <div class="header">
                            <div class="logo-section">
                                <h1>Kurup & Co.</h1>
                                <p>Legal Chambers & Associates</p>
                            </div>
                            <div class="address-section">
                                Level 24, Legal Tower, Financial District<br>
                                Kochi, Kerala, 682031, India<br>
                                T: +91 484-2274 9292<br>
                                E: office@kurupco.com
                            </div>
                        </div>
                        
                        <div class="divider"></div>
                        
                        <div class="report-title">OFFICIAL CASE RECORD</div>
                        
                        <div class="meta-bar">
                            <div class="meta-item">
                                <span class="meta-label">File Reference</span>
                                <span class="meta-value">${reportId}</span>
                            </div>
                            <div class="meta-item">
                                <span class="meta-label">Date Generated</span>
                                <span class="meta-value">${today}</span>
                            </div>
                            <div class="meta-item">
                                <span class="meta-label">Client Entity</span>
                                <span class="meta-value">${selectedSociety}</span>
                            </div>
                            <div class="meta-item">
                                <span class="meta-label">Document Status</span>
                                <span class="badge-confidential">LEGAL PRIVILEGE</span>
                            </div>
                        </div>
                        
                        <div class="section-title">1. Case Abstracts & Particulars</div>
                        
                        <div class="data-grid">
                            <div class="data-item full-width">
                                <div class="data-label">Case Subject / Title</div>
                                <div class="data-value" style="font-weight: 700; color: #1e40af;">${caseItem.name}</div>
                            </div>
                            
                            <div class="data-item">
                                <div class="data-label">Case Number (CNR/Filing)</div>
                                <div class="data-value" style="font-family: monospace;">${caseItem.case_no}</div>
                            </div>
                            
                            <div class="data-item">
                                <div class="data-label">Filing Year</div>
                                <div class="data-value">${caseItem.case_year}</div>
                            </div>
                            
                            <div class="data-item">
                                <div class="data-label">Case Category</div>
                                <div class="data-value">${caseItem.category || 'General Civil'}</div>
                            </div>
                            
                            <div class="data-item">
                                <div class="data-label">Current Status</div>
                                <div class="data-value">
                                    <span class="status-badge" style="background: ${getStatusBg(caseItem.status)}; color: ${getStatusColor(caseItem.status)}">
                                        ${caseItem.status}
                                    </span>
                                </div>
                            </div>
                             
                             <div class="data-item full-width">
                                <div class="data-label">Client / Society Name</div>
                                <div class="data-value">${selectedSociety}</div>
                            </div>
                        </div>
                        
                        <div class="footer">
                            <div class="footer-left">
                                Firm Registration: KC/2004/9910 • Bar Council ID: 485/2024<br>
                                This document contains privileged information intended only for the use of the individual or entity named above.
                            </div>
                            <div class="footer-right">
                                <div class="signature-line"></div>
                                <div class="signature-label">Senior Counsel Signature</div>
                                <div class="page-num">PAGE 01 OF 01</div>
                            </div>
                        </div>

                        <script>
                            window.onload = function() { window.print(); }
                        </script>
                    </body>
                </html>
            `);
            printWindow.document.close();
        }
    };

    const handleDelete = (name: string) => {
        console.log('Delete society:', name);
        // Confirm delete
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-200">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                        <Building className="h-6 w-6 text-blue-600" />
                        Society Details
                    </h2>
                    <p className="text-slate-500 text-sm">
                        Overview of all societies and their associated case records.
                    </p>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search societies..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-white border-slate-200 focus:border-blue-500 rounded-xl"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                        <Loader2 className="h-8 w-8 animate-spin mb-2" />
                        <p>Loading society data...</p>
                    </div>
                ) : filteredStats.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                        <Building className="h-12 w-12 text-slate-300 mb-3" />
                        <h3 className="text-lg font-medium text-slate-900">No societies found</h3>
                        <p className="text-sm">Try adjusting your search query.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Society Name
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        No. of Cases
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {filteredStats.map((stat, index) => (
                                    <tr key={index} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                                    <Building className="h-4 w-4" />
                                                </div>
                                                <span className="text-sm font-medium text-slate-900">
                                                    {stat.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-slate-400" />
                                                <span className="text-sm text-slate-700 font-medium">
                                                    {stat.count}
                                                </span>
                                                <span className="text-xs text-slate-500">records</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleView(stat.name)}
                                                    className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                                    title="View Cases"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(stat.name)}
                                                    className="h-8 w-8 p-0 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                                                    title="Edit Society Name"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(stat.name)}
                                                    className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Cases List Modal */}
            {isModalOpen && selectedSociety && (
                <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in md:pl-72">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden animate-scale-up ring-1 ring-slate-900/5 flex flex-col max-h-[90vh] relative">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                    <Building className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">{selectedSociety}</h3>
                                    <p className="text-sm text-slate-500">{societyCases.length} records found</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handlePrintAll}
                                    className="hidden sm:flex"
                                >
                                    <Printer className="mr-2 h-4 w-4" />
                                    Print List
                                </Button>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 hover:bg-slate-200/50 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-0 overflow-y-auto bg-slate-50/30 flex-1">
                            {loadingCases ? (
                                <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                                    <Loader2 className="h-8 w-8 animate-spin mb-3 text-blue-500" />
                                    <p>Loading cases...</p>
                                </div>
                            ) : societyCases.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                                    <Scale className="h-12 w-12 text-slate-300 mb-3" />
                                    <p className="font-medium text-slate-900">No cases found</p>
                                    <p className="text-sm">No case records are linked to this society.</p>
                                </div>
                            ) : (
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold text-slate-700 w-1/3">Case Name</th>
                                            <th className="px-6 py-4 font-semibold text-slate-700">Number</th>
                                            <th className="px-6 py-4 font-semibold text-slate-700">Year</th>
                                            <th className="px-6 py-4 font-semibold text-slate-700">Status</th>
                                            <th className="px-6 py-4 font-semibold text-slate-700">Category</th>
                                            <th className="px-6 py-4 font-semibold text-slate-700 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {societyCases.map((c) => (
                                            <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                                                <td className="px-6 py-4 font-medium text-slate-900">{c.name}</td>
                                                <td className="px-6 py-4 font-mono text-slate-600 bg-slate-50/50">{c.case_no || '-'}</td>
                                                <td className="px-6 py-4 text-slate-600">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                                        {c.case_year}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${c.status?.toLowerCase() === 'active' ? 'bg-green-100 text-green-700' :
                                                        c.status?.toLowerCase() === 'closed' || c.status?.toLowerCase() === 'disposed' ? 'bg-slate-100 text-slate-700' :
                                                            'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {c.status || 'Unknown'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600">{c.category || '-'}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handlePrintCase(c)}
                                                        className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                                        title="Print Case"
                                                    >
                                                        <Printer className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        <div className="p-4 bg-white border-t border-slate-100 flex justify-end shrink-0">
                            <Button onClick={() => setIsModalOpen(false)}>Close</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

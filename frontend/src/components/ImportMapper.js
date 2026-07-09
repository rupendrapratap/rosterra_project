import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import './ImportMapper.css';

const SYSTEM_FIELDS = [
    { key: 'name', label: 'Name', required: true },
    { key: 'gender', label: 'Gender', required: true, options: ['Male', 'Female', 'Other'] },
    { key: 'city', label: 'City', required: true },
    { key: 'state', label: 'State', required: true },
    { key: 'instagramurl', label: 'Instagram URL', required: false },
    { key: 'youtubeurl', label: 'YouTube URL', required: false },
    { key: 'followers', label: 'Followers', required: false },
    { key: 'averageView', label: 'Average View', required: false },
    { key: 'er', label: 'Engagement Rate (ER)', required: false },
    { key: 'email', label: 'Email', required: false },
    { key: 'contactno', label: 'Contact No', required: false },
    { key: 'commercial', label: 'Commercial', required: false },
    { key: 'language', label: 'Language', required: false },
    { key: 'category', label: 'Category', required: false },
    { key: 'platform', label: 'Platform', required: false },
];

const ImportMapper = ({ file, onImport, onClose }) => {
    const [headers, setHeaders] = useState([]);
    const [fileData, setFileData] = useState([]);
    const [mapping, setMapping] = useState({});
    const [previewData, setPreviewData] = useState([]);
    const [loading, setLoading] = useState(false);

    // Parse file on mount
    React.useEffect(() => {
        if (file) {
            setLoading(true);
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = e.target.result;
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const sheet = workbook.Sheets[sheetName];
                    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // Get raw array of arrays

                    if (json.length > 0) {
                        const fileHeaders = json[0];
                        const rows = XLSX.utils.sheet_to_json(sheet); // Get object array for data
                        setHeaders(fileHeaders);
                        setFileData(rows);

                        // Auto-automap based on name similarity
                        const newMapping = {};
                        SYSTEM_FIELDS.forEach(field => {
                            const match = fileHeaders.find(h =>
                                h.toLowerCase().replace(/[^a-z0-9]/g, '') === field.key.toLowerCase() ||
                                h.toLowerCase().includes(field.label.toLowerCase())
                            );
                            if (match) {
                                newMapping[field.key] = match;
                            }
                        });
                        setMapping(newMapping);
                        updatePreview(newMapping, rows);
                    }
                } catch (error) {
                    console.error("File parse error:", error);
                    alert("Error parsing file. Please check if the file is a valid Excel or CSV file.");
                    onClose();
                }
                setLoading(false);
            };
            reader.readAsArrayBuffer(file);
        }
    }, [file]);

    const updatePreview = (currentMapping, data) => {
        // Show first 3 rows as they would look after import
        const preview = data.slice(0, 3).map(row => {
            const mappedRow = {};
            Object.keys(currentMapping).forEach(sysKey => {
                const fileHeader = currentMapping[sysKey];
                if (fileHeader) {
                    mappedRow[sysKey] = row[fileHeader];
                }
            });
            return mappedRow;
        });
        setPreviewData(preview);
    };

    const handleMappingChange = (sysKey, fileHeader) => {
        const newMapping = { ...mapping, [sysKey]: fileHeader };
        if (!fileHeader) delete newMapping[sysKey];
        setMapping(newMapping);
        updatePreview(newMapping, fileData);
    };

    const handleImport = () => {
        // Transform all data
        const transformedData = fileData.map(row => {
            const newRow = {};
            Object.keys(mapping).forEach(sysKey => {
                const fileHeader = mapping[sysKey];
                if (fileHeader && row[fileHeader] !== undefined) {
                    let value = row[fileHeader];
                    // Basic cleaning
                    if (typeof value === 'string') value = value.trim();
                    newRow[sysKey] = value;
                }
            });

            // Default basic validation fallback
            if (newRow.gender) {
                const gLower = newRow.gender.toString().trim().toLowerCase();
                if (gLower === 'male') {
                    newRow.gender = 'Male';
                } else if (gLower === 'female') {
                    newRow.gender = 'Female';
                } else {
                    newRow.gender = 'Other';
                }
            } else {
                newRow.gender = 'Other';
            }

            return newRow;
        });

        onImport(transformedData);
    };

    if (loading) return <div className="import-modal">Loading file...</div>;

    return (
        <div className="import-modal-overlay">
            <div className="import-modal">
                <div className="import-header">
                    <h2>Map Columns</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="import-body">
                    <p>Map the columns from your Excel sheet to the system fields.</p>

                    <div className="mapping-grid">
                        <div className="grid-header">
                            <span>System Field</span>
                            <span>Your Excel Column</span>
                        </div>
                        {SYSTEM_FIELDS.map(field => (
                            <div key={field.key} className="mapping-row">
                                <div className="field-label">
                                    {field.label} {field.required && <span className="required">*</span>}
                                </div>
                                <div className="field-select">
                                    <select
                                        value={mapping[field.key] || ''}
                                        onChange={(e) => handleMappingChange(field.key, e.target.value)}
                                    >
                                        <option value="">-- Ignore --</option>
                                        {headers.map(h => (
                                            <option key={h} value={h}>{h}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="preview-section">
                        <h3>Preview (First 3 Rows)</h3>
                        <div className="table-responsive">
                            <table>
                                <thead>
                                    <tr>
                                        {Object.keys(mapping).map(k => <th key={k}>{SYSTEM_FIELDS.find(f => f.key === k)?.label}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {previewData.map((row, i) => (
                                        <tr key={i}>
                                            {Object.keys(mapping).map(k => <td key={k}>{String(row[k] || '')}</td>)}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="import-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleImport}>
                        Import {fileData.length} Records
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImportMapper;

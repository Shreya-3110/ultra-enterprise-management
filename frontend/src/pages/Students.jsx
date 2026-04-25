import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Papa from 'papaparse';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Download,
  X,
  Loader2,
  Trash2,
  UserPlus,
  Pencil,
  FileDown,
  Upload,
  X as XIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { generateStudentReport } from '../utils/reportGenerator';


const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const Students = () => {
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [feeStructures, setFeeStructures] = useState([]);

  // Bulk Upload State
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkResults, setBulkResults] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    currentClass: '',
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    activeFeeStructure: '',
    status: 'INQUIRY'
  });

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/students`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setStudents(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      if (students.length === 0) {
        setStudents([
          { _id: '1', firstName: 'Aryan', lastName: 'Sharma', currentClass: 'X-A', admissionNumber: 'ADM-2024-001', parentDetails: { name: 'Manoj Sharma', phone: '9876543210' }, status: 'ACTIVE' },
          { _id: '2', firstName: 'Sanya', lastName: 'Gupta', currentClass: 'IX-B', admissionNumber: 'ADM-2024-005', parentDetails: { name: 'Rakesh Gupta', phone: '9123456780' }, status: 'ACTIVE' },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchFeeStructures = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/fees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setFeeStructures(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching fees:', error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchStudents();
      fetchFeeStructures();
    }
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      firstName: '',
      lastName: '',
      currentClass: '',
      parentName: '',
      parentEmail: '',
      parentPhone: '',
      activeFeeStructure: '',
      status: 'INQUIRY'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (student) => {
    setEditingId(student._id);
    setFormData({
      firstName: student.firstName,
      lastName: student.lastName,
      currentClass: student.currentClass,
      parentName: student.parentDetails?.name || '',
      parentEmail: student.parentDetails?.email || '',
      parentPhone: student.parentDetails?.phone || '',
      activeFeeStructure: student.activeFeeStructure || '',
      status: student.status || 'ACTIVE'
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      firstName: '',
      lastName: '',
      currentClass: '',
      parentName: '',
      parentEmail: '',
      parentPhone: '',
      activeFeeStructure: '',
      status: 'INQUIRY'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      
      const payload = {
        ...formData,
        parentDetails: {
          name: formData.parentName,
          email: formData.parentEmail,
          phone: formData.parentPhone
        },
        activeFeeStructure: formData.activeFeeStructure === '' ? null : formData.activeFeeStructure,
        feeStructureId: formData.activeFeeStructure === '' ? null : formData.activeFeeStructure
      };

      if (editingId) {
        const response = await axios.put(`${API_BASE_URL}/students/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          closeModal();
          await fetchStudents();
        }
      } else {
        const response = await axios.post(`${API_BASE_URL}/students`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          closeModal();
          await fetchStudents();
        }
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save student');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!bulkFile) return;

    setIsUploading(true);

    Papa.parse(bulkFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const formattedStudents = results.data.map(row => ({
             admissionNumber: row.admissionNumber,
             firstName: row.firstName,
             lastName: row.lastName,
             currentClass: row.currentClass,
             parentDetails: {
                name: row.parentName,
                phone: row.parentPhone
             }
          }));

          const response = await axios.post(`${API_BASE_URL}/students/bulk`, { students: formattedStudents }, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (response.data.success) {
            setBulkResults({ 
              success: response.data.count, 
              duplicates: 0, 
              errors: 0, 
              details: [`Imported ${response.data.count} students successfully`] 
            });
            fetchStudents();
          }
        } catch (error) {
          alert(error.response?.data?.message || 'Bulk JSON sync failed');
        } finally {
          setIsUploading(false);
        }
      },
      error: (err) => {
         console.error('CSV Parsing Error', err);
         alert('Failed to parse CSV file securely.');
         setIsUploading(false);
      }
    });
  };

  const downloadTemplate = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const headers = 'admissionNumber,firstName,lastName,currentClass,parentName,parentPhone\n';
    const sample = `ADM-2024-${randomSuffix},John,Doe,X-A,David Doe,9876543210\n`;
    const blob = new Blob([headers + sample], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_import_template.csv';
    a.click();
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove ${name} from the records?`)) {
      try {
        const response = await axios.delete(`${API_BASE_URL}/students/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          setStudents(prev => prev.filter(s => s._id !== id));
        }
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete student');
      }
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Student Directory</h2>
          <p className="text-sm text-slate-500 mt-1">Manage admissions, classes, and guardian details</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => generateStudentReport(students)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Download size={18} />
            Export to PDF
          </button>
          <button 
            onClick={() => setIsBulkModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <FileDown size={18} />
            Bulk Import
          </button>

          <button 
            onClick={openAddModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
          >
            <UserPlus size={18} />
            Add New Record
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm shadow-slate-200/50">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by student name or record ID..." 
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 ring-blue-500/10 focus:bg-white transition-all text-slate-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-80 gap-4">
              <Loader2 className="animate-spin text-blue-500" size={40} />
              <p className="text-sm text-slate-400 font-medium tracking-wide">Syncing records...</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Student Identity</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Class & Section</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Guardian Details</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Account Status</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Fee Plan</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Risk Profile</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student, idx) => (
                  <tr key={student._id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/20'} hover:bg-blue-50/30 transition-colors group`}>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-500 text-xs shadow-sm shadow-slate-100 group-hover:border-blue-200 transition-colors">
                          {student.firstName[0]}{student.lastName[0]}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-800 tracking-tight">{student.firstName} {student.lastName}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">{student.admissionNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-slate-700">{student.currentClass}</p>
                      <p className="text-xs text-slate-400 font-medium">Standard Section</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm text-slate-700 font-bold">{student.parentDetails?.name}</p>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">{student.parentDetails?.phone}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                        student.status === 'ACTIVE' 
                        ? 'bg-green-50 text-green-600 border border-green-100' 
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}>
                        {student.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      {student.activeFeeStructure ? (
                        <span className="text-[10px] font-bold px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-full">
                          {typeof student.activeFeeStructure === 'object' ? student.activeFeeStructure.name : 'Linked'}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-3 py-1 bg-slate-50 text-slate-400 border border-slate-100 rounded-full italic">No Plan Assigned</span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                     {student.riskProfile === 'CRITICAL' ? (
                        <span className="text-[10px] inline-flex items-center px-3 py-1 rounded-full font-bold bg-red-100 text-red-700 border border-red-200 shadow-sm animate-pulse">
                           CRITICAL RISK
                        </span>
                     ) : student.riskProfile === 'HIGH_RISK' ? (
                        <span className="text-[10px] inline-flex items-center px-3 py-1 rounded-full font-bold bg-amber-100 text-amber-700 border border-amber-200">
                           HIGH RISK
                        </span>
                     ) : (
                        <span className="text-[10px] inline-flex items-center px-3 py-1 rounded-full font-bold bg-emerald-100 text-emerald-700">
                           NORMAL
                        </span>
                     )}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openEditModal(student)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Edit Record"
                        >
                          <Pencil size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(student._id, `${student.firstName} ${student.lastName}`)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete Record"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Bulk Import Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="px-8 pt-8 pb-6 bg-slate-50/50">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Bulk Student Import</h3>
                  <p className="text-xs text-slate-500 mt-1">Upload a CSV file to add multiple students at once.</p>
                </div>
                <button 
                  onClick={() => { 
                    setIsBulkModalOpen(false); 
                    setBulkFile(null); 
                    setBulkResults(null); 
                  }}
                  className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400 hover:text-slate-600"
                >
                  <X size={20} />
                </button>
              </div>

              {!bulkResults ? (
                <form onSubmit={handleBulkUpload} className="space-y-6">
                  <div className="border-2 border-dashed border-slate-200 rounded-[2rem] p-8 text-center bg-white hover:border-blue-400 transition-colors group">
                    <input 
                      type="file" 
                      accept=".csv"
                      onChange={(e) => setBulkFile(e.target.files[0])}
                      className="hidden" 
                      id="csv-upload"
                    />
                    <label htmlFor="csv-upload" className="cursor-pointer">
                      <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <Upload size={32} />
                      </div>
                      <p className="text-sm font-bold text-slate-700">{bulkFile ? bulkFile.name : 'Choose CSV file'}</p>
                      <p className="text-xs text-slate-400 mt-1" id="bulk-import-description">Drag and drop or click to browse</p>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <FileDown className="text-blue-600" size={18} />
                      <span className="text-xs font-bold text-blue-700">Need a template?</span>
                    </div>
                    <button 
                      type="button"
                      onClick={downloadTemplate}
                      className="text-xs font-black text-blue-600 hover:underline px-2 py-1"
                    >
                      Download Sample CSV
                    </button>
                  </div>

                  <button 
                    disabled={!bulkFile || isUploading}
                    className="w-full py-4 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 disabled:bg-slate-300 disabled:shadow-none shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Processing...
                      </>
                    ) : (
                      'Start Import'
                    )}
                  </button>
                </form>
              ) : (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-green-50 border border-green-100 p-4 rounded-2xl text-center">
                      <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mb-1">Success</p>
                      <p className="text-2xl font-black text-green-700">{bulkResults.success}</p>
                    </div>
                    <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl text-center">
                      <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">Duplicates</p>
                      <p className="text-2xl font-black text-amber-700">{bulkResults.duplicates}</p>
                    </div>
                    <div className="bg-red-50 border border-red-100 p-4 rounded-2xl text-center">
                      <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-1">Errors</p>
                      <p className="text-2xl font-black text-red-700">{bulkResults.errors}</p>
                    </div>
                  </div>

                  {bulkResults.details.length > 0 && (
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                      {bulkResults.details.map((detail, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] text-slate-500 font-medium font-mono whitespace-nowrap overflow-hidden text-ellipsis">
                          {detail}
                        </div>
                      ))}
                    </div>
                  )}

                  <button 
                    onClick={() => {
                      setIsBulkModalOpen(false);
                      setBulkResults(null);
                      setBulkFile(null);
                    }}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Unified Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">{editingId ? 'Update Student' : 'Register Student'}</h3>
                <p className="text-xs text-slate-400 mt-1 font-medium">{editingId ? 'Modify existing academic record' : 'Add a new academic life cycle entry'}</p>
              </div>
              <button 
                onClick={closeModal}
                className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-2xl transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                  <input 
                    required
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm outline-none focus:ring-2 ring-blue-500/10 focus:bg-white transition-all text-slate-700 font-medium"
                    placeholder="Rahul"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                  <input 
                    required
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm outline-none focus:ring-2 ring-blue-500/10 focus:bg-white transition-all text-slate-700 font-medium"
                    placeholder="Kumar"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Class Assignment</label>
                <input 
                  required
                  name="currentClass"
                  value={formData.currentClass}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm outline-none focus:ring-2 ring-blue-500/10 focus:bg-white transition-all text-slate-700 font-medium"
                  placeholder="e.g. X-A"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Guardian Identity</label>
                <input 
                  required
                  name="parentName"
                  value={formData.parentName}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm outline-none focus:ring-2 ring-blue-500/10 focus:bg-white transition-all text-slate-700 font-medium"
                  placeholder="Full name of parent"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Guardian Email Identity</label>
                <input 
                  required
                  type="email"
                  name="parentEmail"
                  value={formData.parentEmail}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm outline-none focus:ring-2 ring-blue-500/10 focus:bg-white transition-all text-slate-700 font-medium"
                  placeholder="parent@example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Contact Channel</label>
                <input 
                  required
                  name="parentPhone"
                  value={formData.parentPhone}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm outline-none focus:ring-2 ring-blue-500/10 focus:bg-white transition-all text-slate-700 font-medium"
                  placeholder="Mobile number"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Fee Plan Assignment</label>
                <select 
                  name="activeFeeStructure"
                  value={formData.activeFeeStructure}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm outline-none focus:ring-2 ring-blue-500/10 focus:bg-white transition-all text-slate-700 font-bold appearance-none"
                >
                  <option value="">No Active Plan</option>
                  {feeStructures.map(fee => (
                    <option key={fee._id} value={fee._id}>
                      {fee.name} (INR {fee.totalAmount?.toLocaleString() || '0'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Lifecycle Status</label>
                <select 
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm outline-none focus:ring-2 ring-blue-500/10 focus:bg-white transition-all text-slate-700 font-bold appearance-none"
                >
                  <option value="INQUIRY">INQUIRY (Prospect)</option>
                  <option value="ACTIVE">ACTIVE (Enrolled)</option>
                  <option value="INACTIVE">INACTIVE (Suspended)</option>
                  <option value="ALUMNI">ALUMNI (Graduated)</option>
                </select>
              </div>

              <div className="pt-6 flex gap-4">
                <button 
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-all font-sans"
                >
                  Discard
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-4 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/30 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {submitting ? <Loader2 className="animate-spin" size={20} /> : (editingId ? <Pencil size={20} /> : <UserPlus size={20} />)}
                  {submitting ? 'Processing...' : (editingId ? 'Update Record' : 'Add Student')}
                </button>
              </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;


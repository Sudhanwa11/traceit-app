import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import itemService from '../services/itemService';
import { categories } from '../utils/categoryData';
import './Form.css';

const RequestItemPage = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { isAuthenticated, loading } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        itemName: '',
        description: '',
        mainCategory: '',
        subCategory: '',
        location: '',
        priceRange: '',
        retrievalImportance: ''
    });
    
    const [subCategoryOptions, setSubCategoryOptions] = useState([]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [files, setFiles] = useState(null);
    const [submittedItem, setSubmittedItem] = useState(null); // State to hold the new item

    const { itemName, description, mainCategory, subCategory, location, priceRange, retrievalImportance } = formData;

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, loading, navigate]);

    const handleMainCategoryChange = e => {
        const selectedMainCategory = e.target.value;
        setFormData({ 
            ...formData, 
            mainCategory: selectedMainCategory, 
            subCategory: ''
        });
        setSubCategoryOptions(categories[selectedMainCategory] || []);
    };

    const onChange = e => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
        setMessage('');
    };

    const onFileChange = e => {
        setFiles(e.target.files);
    };

    const onSubmit = async e => {
        e.preventDefault();
        setError('');
        setMessage('Submitting your request...');

        if (!mainCategory || !subCategory || !priceRange || !retrievalImportance) {
            setError('Please fill out all fields, including the dropdowns.');
            setMessage('');
            return;
        }

        const data = new FormData();
        for (const key in formData) {
            data.append(key, formData[key]);
        }
        if (files) {
            for (let i = 0; i < files.length; i++) {
                data.append('media', files[i]);
            }
        }
        data.append('status', 'Lost');

        try {
            const newItem = await itemService.reportItem(data);
            setSubmittedItem(newItem); // On success, save the new item and switch views
        } catch (err) {
            const errorMessage = err.response?.data?.msg || t('requestPage.errorMessage');
            setError(errorMessage);
            setMessage('');
        }
    };

    const resetForm = () => {
        setFormData({
            itemName: '', description: '', mainCategory: '', subCategory: '',
            location: '', priceRange: '', retrievalImportance: ''
        });
        setFiles(null);
        setSubCategoryOptions([]);
        setSubmittedItem(null);
    };

    return (
        <div className="form-container">
            {submittedItem ? (
                // --- SUCCESS VIEW ---
                <div className="form-wrapper success-view">
                    <h2>✅</h2>
                    <h2>{t('requestPage.successTitle')}</h2>
                    <p>{t('requestPage.successText')}</p>
                    <Link to={`/matches/${submittedItem._id}`} className="btn-submit view-matches-btn">
                        View Potential Matches
                    </Link>
                    <button className="btn-secondary" onClick={resetForm} style={{marginTop: '1rem'}}>
                        {t('requestPage.requestAnother')}
                    </button>
                </div>
            ) : (
                // --- FORM VIEW ---
                <div className="form-wrapper">
                    <h2>{t('requestPage.title')}</h2>
                    <p>{t('requestPage.subtitle')}</p>
                    
                    {error && <div className="error-message">{error}</div>}
                    {message && <div className="success-message">{message}</div>}

                    <form onSubmit={onSubmit}>
                       {/* Form fields are unchanged */}
                        <div className="form-group">
                            <label>{t('requestPage.itemName')}</label>
                            <input type="text" name="itemName" value={itemName} onChange={onChange} required />
                        </div>
                        <div className="form-group">
                            <label>{t('requestPage.description')}</label>
                            <textarea name="description" value={description} onChange={onChange} required placeholder={t('requestPage.descriptionPlaceholder')}></textarea>
                        </div>

                        <div className="form-group">
                            <label>{t('reportPage.category')}</label>
                            <select name="mainCategory" value={mainCategory} onChange={handleMainCategoryChange} required>
                                <option value="" disabled>{t('reportPage.selectMainCategory')}</option>
                                {Object.keys(categories).map(cat => (
                                    <option key={cat} value={cat}>
                                        {t(`categories.${cat}._main`)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="form-group">
                            <label>{t('requestPage.subCategory', 'Sub-Category')}</label>
                            <select name="subCategory" value={subCategory} onChange={onChange} required disabled={!mainCategory}>
                                <option value="" disabled>{t('reportPage.selectSubCategory')}</option>
                                {subCategoryOptions.map(subCat => (
                                    <option key={subCat} value={subCat}>
                                        {t(`categories.${mainCategory}.${subCat}`)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>{t('requestPage.location')}</label>
                            <input type="text" name="location" value={location} onChange={onChange} required placeholder={t('requestPage.locationPlaceholder')} />
                        </div>
                        <div className="form-group">
                            <label>{t('requestPage.priceRange')}</label>
                            <select name="priceRange" value={priceRange} onChange={onChange} required>
                                <option value="" disabled>{t('requestPage.selectPrice')}</option>
                                <option value="< ₹500">&lt; ₹500</option>
                                <option value="₹500 - ₹2000">₹500 - ₹2000</option>
                                <option value="₹2000 - ₹5000">₹2000 - ₹5000</option>
                                <option value="> ₹5000">&gt; ₹5000</option>
                                <option value="Priceless">Priceless</option>
                            </select>
                        </div>
                         <div className="form-group">
                            <label>{t('requestPage.importance')}</label>
                            <select name="retrievalImportance" value={retrievalImportance} onChange={onChange} required>
                                <option value="" disabled>{t('requestPage.selectImportance')}</option>
                                <option value="Most Important">Most Important</option>
                                <option value="Somewhat Important">Somewhat Important</option>
                                <option value="Normal Importance">Normal Importance</option>
                                <option value="Trying Out Luck">Trying Out Luck</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>{t('requestPage.mediaUpload')}</label>
                            <input type="file" name="media" onChange={onFileChange} multiple accept="image/*,video/*" />
                        </div>

                        <button type="submit" className="btn-submit">{t('requestPage.submit')}</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default RequestItemPage;
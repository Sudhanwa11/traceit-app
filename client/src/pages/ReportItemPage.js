import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import itemService from '../services/itemService';
import { categories } from '../utils/categoryData';
import './Form.css';

const ReportItemPage = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { isAuthenticated, loading } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        itemName: '',
        description: '',
        mainCategory: '',
        subCategory: '',
        location: '',
        currentLocation: ''
    });

    const [subCategoryOptions, setSubCategoryOptions] = useState([]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [files, setFiles] = useState(null);

    const { itemName, description, mainCategory, subCategory, location, currentLocation } = formData;

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
        setMessage('Submitting report...');

        if (!mainCategory || !subCategory) {
            setError('Please select both a main and sub-category.');
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
        data.append('status', 'Found');

        try {
            await itemService.reportItem(data);
            setMessage(t('reportPage.successMessage'));
            
            setTimeout(() => {
                navigate('/');
            }, 2000);

        } catch (err) {
            const errorMessage = err.response?.data?.msg || t('reportPage.errorMessage');
            setError(errorMessage);
            setMessage('');
        }
    };

    return (
        <div className="form-container">
            <div className="form-wrapper">
                <h2>{t('reportPage.title')}</h2>
                <p>{t('reportPage.subtitle')}</p>
                
                {error && <div className="error-message">{error}</div>}
                {message && <div className="success-message">{message}</div>}

                <form onSubmit={onSubmit}>
                    <div className="form-group">
                        <label>{t('reportPage.itemName')}</label>
                        <input type="text" name="itemName" value={itemName} onChange={onChange} required />
                    </div>
                    <div className="form-group">
                        <label>{t('reportPage.description')}</label>
                        <textarea name="description" value={description} onChange={onChange} required placeholder={t('reportPage.descriptionPlaceholder')}></textarea>
                    </div>

                    <div className="form-group">
                        <label>{t('reportPage.category')}</label>
                        <select name="mainCategory" value={mainCategory} onChange={handleMainCategoryChange} required>
                            {/* UPDATED LINE */}
                            <option value="" disabled>{t('reportPage.selectMainCategory')}</option>
                            {Object.keys(categories).map(cat => (
                                <option key={cat} value={cat}>
                                    {t(`categories.${cat}._main`)}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="form-group">
                        <label>{t('reportPage.subCategory', 'Sub-Category')}</label>
                        <select name="subCategory" value={subCategory} onChange={onChange} required disabled={!mainCategory}>
                            {/* UPDATED LINE */}
                            <option value="" disabled>{t('reportPage.selectSubCategory')}</option>
                            {subCategoryOptions.map(subCat => (
                                <option key={subCat} value={subCat}>
                                    {t(`categories.${mainCategory}.${subCat}`)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>{t('reportPage.locationFound')}</label>
                        <input type="text" name="location" value={location} onChange={onChange} required placeholder={t('reportPage.locationFoundPlaceholder')} />
                    </div>
                    <div className="form-group">
                        <label>{t('reportPage.currentLocation')}</label>
                        <input type="text" name="currentLocation" value={currentLocation} onChange={onChange} required placeholder={t('reportPage.currentLocationPlaceholder')} />
                    </div>
                    
                    <div className="form-group">
                        <label>{t('reportPage.mediaUpload')}</label>
                        <input type="file" name="media" onChange={onFileChange} multiple accept="image/*,video/*" />
                    </div>

                    <button type="submit" className="btn-submit">{t('reportPage.submit')}</button>
                </form>
            </div>
        </div>
    );
};

export default ReportItemPage;
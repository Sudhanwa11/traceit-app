// client/src/pages/ReportItemPage.js
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
    currentLocation: '',
    // If you later add these fields in UI, keep them here:
    // retrievalImportance: '',
    // priceRange: '',
  });

  const [subCategoryOptions, setSubCategoryOptions] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [files, setFiles] = useState([]); // store as array for easy pass-through
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    itemName,
    description,
    mainCategory,
    subCategory,
    location,
    currentLocation,
    // retrievalImportance,
    // priceRange,
  } = formData;

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  const handleMainCategoryChange = (e) => {
    const selectedMainCategory = e.target.value;

    // Safely derive subcategory options regardless of structure
    let options = [];
    const cat = categories[selectedMainCategory];
    if (Array.isArray(cat)) {
      options = cat;
    } else if (cat && typeof cat === 'object') {
      // if your data structure is an object with keys (skip _main if present)
      options = Object.keys(cat).filter((k) => k !== '_main');
    }

    setFormData((prev) => ({
      ...prev,
      mainCategory: selectedMainCategory,
      subCategory: '',
    }));
    setSubCategoryOptions(options);
  };

  const onChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
    setMessage('');
  };

  const onFileChange = (e) => {
    // Store as array; itemService expects Array<File>
    setFiles(Array.from(e.target.files || []));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('Submitting report...');

    if (!mainCategory || !subCategory) {
      setError('Please select both a main and sub-category.');
      setMessage('');
      return;
    }

    try {
      await itemService.reportItem({
        status: 'Found', // IMPORTANT
        itemName,
        description,
        mainCategory,
        subCategory,
        location,
        currentLocation,
        // retrievalImportance,
        // priceRange,
        mediaFiles: files, // pass array of files; service builds FormData if any
      });

      setIsSubmitted(true);
    } catch (err) {
      const errorMessage = err?.response?.data?.msg || t('reportPage.errorMessage');
      setError(errorMessage);
      setMessage('');
    }
  };

  const resetForm = () => {
    setFormData({
      itemName: '',
      description: '',
      mainCategory: '',
      subCategory: '',
      location: '',
      currentLocation: '',
    });
    setFiles([]);
    setSubCategoryOptions([]);
    setIsSubmitted(false);
  };

  return (
    <div className="form-container">
      {isSubmitted ? (
        <div className="form-wrapper success-view">
          <h2>✅</h2>
          <h2>{t('reportPage.successTitle')}</h2>
          <p>{t('reportPage.successText')}</p>
          <div className="success-actions">
            <button className="btn-submit" onClick={resetForm}>
              {t('reportPage.reportAnother')}
            </button>
          </div>
        </div>
      ) : (
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
              <textarea
                name="description"
                value={description}
                onChange={onChange}
                required
                placeholder={t('reportPage.descriptionPlaceholder')}
              />
            </div>

            <div className="form-group">
              <label>{t('reportPage.category')}</label>
              <select
                name="mainCategory"
                value={mainCategory}
                onChange={handleMainCategoryChange}
                required
              >
                <option value="" disabled>
                  {t('reportPage.selectMainCategory')}
                </option>
                {Object.keys(categories).map((cat) => (
                  <option key={cat} value={cat}>
                    {t(`categories.${cat}._main`, cat)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>{t('reportPage.subCategory', 'Sub-Category')}</label>
              <select
                name="subCategory"
                value={subCategory}
                onChange={onChange}
                required
                disabled={!mainCategory}
              >
                <option value="" disabled>
                  {t('reportPage.selectSubCategory')}
                </option>
                {subCategoryOptions.map((subCat) => (
                  <option key={subCat} value={subCat}>
                    {t(`categories.${mainCategory}.${subCat}`, subCat)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>{t('reportPage.locationFound')}</label>
              <input
                type="text"
                name="location"
                value={location}
                onChange={onChange}
                required
                placeholder={t('reportPage.locationFoundPlaceholder')}
              />
            </div>

            <div className="form-group">
              <label>{t('reportPage.currentLocation')}</label>
              <input
                type="text"
                name="currentLocation"
                value={currentLocation}
                onChange={onChange}
                required
                placeholder={t('reportPage.currentLocationPlaceholder')}
              />
            </div>

            <div className="form-group">
              <label>{t('reportPage.mediaUpload')}</label>
              <input
                type="file"
                name="media"
                onChange={onFileChange}
                multiple
                accept="image/*,video/*"
              />
            </div>

            <button type="submit" className="btn-submit">
              {t('reportPage.submit')}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ReportItemPage;

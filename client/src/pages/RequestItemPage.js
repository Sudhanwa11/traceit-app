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
  const [files, setFiles] = useState([]); // store as an array
  const [submittedItem, setSubmittedItem] = useState(null);

  const {
    itemName,
    description,
    mainCategory,
    subCategory,
    location,
    priceRange,
    retrievalImportance
  } = formData;

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  const handleMainCategoryChange = (e) => {
    const selectedMainCategory = e.target.value;

    // Derive subcategory options safely (array or object with _main)
    let options = [];
    const cat = categories[selectedMainCategory];
    if (Array.isArray(cat)) {
      options = cat;
    } else if (cat && typeof cat === 'object') {
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
    setFiles(Array.from(e.target.files || []));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('Submitting your request...');

    // basic validation
    if (!itemName || !description || !mainCategory || !subCategory || !location) {
        setError('Please fill out all required fields.');
        setMessage('');
        return;
    }

    try {
        await itemService.reportItem({
        status: 'Lost',
        itemName,
        description,
        mainCategory,
        subCategory,
        location,
        priceRange,
        retrievalImportance,
        mediaFiles: files ? Array.from(files) : [], // <-- array of File
        });

        // success view
        setSubmittedItem({
        _id: 'temp', // you can set the real returned id if you use the response
        });
        setMessage('');
    } catch (err) {
        console.error('Error reporting lost item:', err);
        const errorMessage = err?.response?.data?.msg || 'Failed to submit item request.';
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
      priceRange: '',
      retrievalImportance: ''
    });
    setFiles([]);
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
          <div className="success-actions">
            <Link to={`/matches/${submittedItem._id}`} className="btn-submit">
              View Potential Matches
            </Link>
            <button className="btn-secondary" onClick={resetForm}>
              {t('requestPage.requestAnother')}
            </button>
          </div>
        </div>
      ) : (
        // --- FORM VIEW ---
        <div className="form-wrapper">
          <h2>{t('requestPage.title')}</h2>
          <p>{t('requestPage.subtitle')}</p>

          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}

          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label>{t('requestPage.itemName')}</label>
              <input
                type="text"
                name="itemName"
                value={itemName}
                onChange={onChange}
                required
              />
            </div>

            <div className="form-group">
              <label>{t('requestPage.description')}</label>
              <textarea
                name="description"
                value={description}
                onChange={onChange}
                required
                placeholder={t('requestPage.descriptionPlaceholder')}
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
              <label>{t('requestPage.subCategory', 'Sub-Category')}</label>
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
              <label>{t('requestPage.location')}</label>
              <input
                type="text"
                name="location"
                value={location}
                onChange={onChange}
                required
                placeholder={t('requestPage.locationPlaceholder')}
              />
            </div>

            <div className="form-group">
              <label>{t('requestPage.priceRange')}</label>
              <select
                name="priceRange"
                value={priceRange}
                onChange={onChange}
              >
                <option value="">{t('requestPage.selectPrice')}</option>
                <option value="< ₹500">&lt; ₹500</option>
                <option value="₹500 - ₹2000">₹500 - ₹2000</option>
                <option value="₹2000 - ₹5000">₹2000 - ₹5000</option>
                <option value="> ₹5000">&gt; ₹5000</option>
                <option value="Priceless">Priceless</option>
              </select>
            </div>

            <div className="form-group">
              <label>{t('requestPage.importance')}</label>
              <select
                name="retrievalImportance"
                value={retrievalImportance}
                onChange={onChange}
              >
                <option value="">{t('requestPage.selectImportance')}</option>
                <option value="Most Important">Most Important</option>
                <option value="Somewhat Important">Somewhat Important</option>
                <option value="Normal Importance">Normal Importance</option>
                <option value="Trying Out Luck">Trying Out Luck</option>
              </select>
            </div>

            <div className="form-group">
              <label>{t('requestPage.mediaUpload')}</label>
              <input
                type="file"
                name="media"
                onChange={onFileChange}
                multiple
                accept="image/*,video/*"
              />
            </div>

            <button type="submit" className="btn-submit">
              {t('requestPage.submit')}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default RequestItemPage;

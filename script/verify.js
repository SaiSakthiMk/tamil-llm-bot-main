(() => {
  // Built-in fallback database for offline/static/file:// usage
  const localFallbackCertificates = {
    "SCT/JUN26/2924": {
      "id": "SCT/JUN26/2924",
      "name": "SAISAKTHI MK",
      "track": "Prompt Engineering",
      "college": "SRM Institute of Science and Technology",
      "lor": true,
      "date": "2026-07-03"
    }
  };

  // Extract query parameters
  const queryParams = new URLSearchParams(window.location.search);
  const idParam = queryParams.get('id');

  // Select elements once
  const elements = {
    failed: document.querySelector('#failed-verification'),
    loader: document.querySelector("#loader"),
    searchForm: document.querySelector('form[name="verify"]'),
    certificateBox: document.querySelector('#certificate-details'),
    nameField: document.querySelector('#name-box'),
    idField: document.querySelector('#id-box'),
    clgField: document.querySelector('#college-box'),
    dateField: document.querySelector('#start-box'),
    trackField: document.querySelector('#track-box'),
    lorField: document.querySelector('#lor-box'),
    lor: document.querySelector('#lor-li'),
    inputField: document.querySelector('#id')
  };

  /**
   * Toggle visibility of elements
   * @param {HTMLElement[]} show - Elements to show
   * @param {HTMLElement[]} hide - Elements to hide
   */
  const toggleVisibility = (show = [], hide = []) => {
    show.forEach(el => el?.classList.remove('xc'));
    hide.forEach(el => el?.classList.add('xc'));
  };

  /**
   * Fetch certificate data from API or fallbacks
   * @param {string} id - Certificate ID
   */
  const fetchCertificate = async (id) => {
    const cleanId = id.trim();
    if (elements.inputField) {
      elements.inputField.value = cleanId;
    }

    try {
      elements.loader.classList.add('flex');
      toggleVisibility([elements.loader], [elements.searchForm, elements.failed, elements.certificateBox]);

      let data = null;

      // 1. Try local Netlify function / API endpoint
      try {
        const response = await fetch(`/.netlify/functions/verify?id=${encodeURIComponent(cleanId)}`);
        if (response.ok) {
          data = await response.json();
        }
      } catch (err) {
        // Fallback if not hosted on netlify
      }

      // 2. Try loading from data/certificates.json
      if (!data) {
        try {
          const res = await fetch('data/certificates.json');
          if (res.ok) {
            const certs = await res.json();
            data = certs[cleanId] || certs[cleanId.toUpperCase()];
          }
        } catch (err) {
          // Ignore fetch error in file:// protocol
        }
      }

      // 3. Check offline/embedded fallback
      if (!data) {
        data = localFallbackCertificates[cleanId] || localFallbackCertificates[cleanId.toUpperCase()];
      }

      // 4. Try remote upstream if running on a live browser that allows it
      if (!data) {
        try {
          const remoteRes = await fetch(`https://skillcrafttech.com/.netlify/functions/verify?id=${encodeURIComponent(cleanId)}`);
          if (remoteRes.ok) {
            data = await remoteRes.json();
          }
        } catch (err) {}
      }

      if (!data || !data.name) {
        throw new Error('Certificate not found');
      }

      // Populate fields
      elements.nameField.textContent = data.name || 'N/A';
      elements.idField.textContent = data.id || 'N/A';
      elements.dateField.textContent = data.date || 'N/A';
      elements.trackField.textContent = data.track || 'N/A';
      elements.clgField.textContent = data.college || 'N/A';
      elements.lorField.textContent = data.lor ? "Yes" : "No";
      elements.lor.classList.toggle("xc", !data.lor);

      toggleVisibility([elements.certificateBox], [elements.loader, elements.searchForm]);
    } catch (error) {
      console.error("Error fetching data:", error);
      toggleVisibility([elements.failed, elements.searchForm], [elements.loader, elements.certificateBox]);
    } finally {
      elements.loader.classList.remove('flex');
    }
  };

  /**
   * Handle form submission
   * @param {Event} event - Form submit event
   */
  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const id = formData.get('id')?.trim();
    if (id) {
      // Update browser URL query string without reloading
      const newUrl = `${window.location.pathname}?id=${encodeURIComponent(id)}`;
      window.history.pushState({ path: newUrl }, '', newUrl);
      await fetchCertificate(id);
    }
  };

  // Attach event listener to form
  elements.searchForm?.addEventListener("submit", handleSubmit);

  // If ID is in URL, auto-fetch
  if (idParam) fetchCertificate(idParam);
})();

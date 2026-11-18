(() => {
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
    lor: document.querySelector('#lor-li')
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
   * Fetch certificate data from API
   * @param {string} id - Certificate ID
   */
  const fetchCertificate = async (id) => {
    try {
      elements.loader.classList.add('flex');
      toggleVisibility([elements.loader], [elements.searchForm, elements.failed, elements.certificateBox]);

      const response = await fetch(`/.netlify/functions/verify?id=${id}`);
      if (!response.ok) throw new Error(`API error: ${response.statusText}`);

      const data = await response.json();

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
    if (id) await fetchCertificate(id);
  };

  // Attach event listener to form
  elements.searchForm?.addEventListener("submit", handleSubmit);

  // If ID is in URL, auto-fetch
  if (idParam) fetchCertificate(idParam);
})();

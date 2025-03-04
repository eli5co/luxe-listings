// Import Airtable library
const Airtable = require("airtable")

// Initialize Airtable
const base = new Airtable({ apiKey: "patMnLQml5296UyET.cdc22a9921c023d5219591898b1dcc6ee67b7bf55e056010341e346b8425f1bd" }).base("appYjFjlExUB5nceS")

// Banner settings for fallback
let bannerSettings = {
  title: "Find Your Dream Home",
  subtitle: "Discover the perfect property in your desired location",
  // Fixed URL to a specific luxury property image instead of random Unsplash
  image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&q=80",
  logoText: "LUXURY PROPERTIES"
}

// Create site logo at the top left corner
function createSiteLogo() {
  // Check if logo already exists
  if (document.querySelector(".site-logo")) {
    return; // Logo already exists, don't create it again
  }
  
  // Create the logo element
  const logoElement = document.createElement("div");
  logoElement.className = "site-logo";
  logoElement.textContent = bannerSettings.logoText;
  
  // Style the logo
  logoElement.style.position = "absolute";
  logoElement.style.top = "2rem";
  logoElement.style.left = "5rem";
  logoElement.style.zIndex = "100";
  logoElement.style.color = "#fff";
  logoElement.style.fontSize = "2rem";
  logoElement.style.fontWeight = "300";
  logoElement.style.letterSpacing = "2px";
  logoElement.style.textTransform = "uppercase";
  logoElement.style.backgroundColor = "rgba(0, 0, 0, 0.3)";
  logoElement.style.padding = "0.5rem 1.5rem";
  logoElement.style.borderRadius = "4px";
  logoElement.style.cursor = "pointer";
  
  // Add click event to scroll to top
  logoElement.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  
  // Add the logo to the body, at the beginning
  document.body.insertBefore(logoElement, document.body.firstChild);
  
  // Add media query styles for responsiveness
  const style = document.createElement("style");
  style.textContent = `
    @media screen and (max-width: 768px) {
      .site-logo {
        left: 2rem !important;
        font-size: 1.8rem !important;
      }
    }
    
    @media screen and (max-width: 576px) {
      .site-logo {
        left: 1rem !important;
        font-size: 1.6rem !important;
        padding: 0.4rem 1rem !important;
      }
    }
  `;
  document.head.appendChild(style);
}

// Fetch and update banner content - only using SiteSettings or default values
function fetchBannerSettings() {
  // Check if SiteSettings table exists and try to get banner settings from it
  try {
    base("SiteSettings")
      .select({
        view: "Grid view",
        maxRecords: 1,
        fields: ["BannerTitle", "BannerSubtitle", "BannerImage"]
      })
      .firstPage((err, records) => {
        if (err || !records || records.length === 0) {
          console.log("No dedicated banner settings found, using default values")
          // If no dedicated settings table or error, use default settings
          useDefaultBannerSettings()
          return
        }
        
        // We have settings from the SiteSettings table
        const settingsRecord = records[0]
        updateBannerFromSettings(settingsRecord)
      })
  } catch (error) {
    // If SiteSettings table doesn't exist or any other error occurs
    console.log("Error accessing SiteSettings table, using default values:", error)
    useDefaultBannerSettings()
  }
}

// Use default banner settings from the settings object
function useDefaultBannerSettings() {
  const banner = document.querySelector(".banner")
  if (banner) {
    banner.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.65)), url('${bannerSettings.image}')`
    banner.style.backgroundSize = "cover"
    banner.style.backgroundPosition = "center"
  }
  
  // Set default text content
  const heading = document.querySelector(".banner-content h1")
  if (heading) {
    heading.textContent = bannerSettings.title
    
    // Add underline effect to the main heading
    heading.style.paddingBottom = "1rem"
    heading.style.borderBottom = "2px solid #c9a55c"
    heading.style.display = "inline-block"
    heading.style.marginBottom = "2.5rem"
  }
  
  document.querySelector(".banner-content p").textContent = bannerSettings.subtitle
  
  // Create site logo
  createSiteLogo()
}

// New function to update banner using dedicated settings
function updateBannerFromSettings(record) {
  const title = record.get("BannerTitle") || bannerSettings.title
  const subtitle = record.get("BannerSubtitle") || bannerSettings.subtitle
  const bannerImage = record.get("BannerImage")?.[0]?.url || bannerSettings.image

  // Set heading with underline effect
  const heading = document.querySelector(".banner-content h1")
  if (heading) {
    heading.textContent = title
    
    // Add underline effect to the main heading
    heading.style.paddingBottom = "1rem"
    heading.style.borderBottom = "2px solid #c9a55c"
    heading.style.display = "inline-block"
    heading.style.marginBottom = "2.5rem"
  }
  
  document.querySelector(".banner-content p").textContent = subtitle
  
  // Update banner background
  const banner = document.querySelector(".banner")
  if (banner) {
    banner.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.65)), url('${bannerImage}')`
    banner.style.backgroundSize = "cover"
    banner.style.backgroundPosition = "center"
  }
  
  // Create site logo
  createSiteLogo()
}

// Remove the old addLogoToBanner function since we're not using it anymore
// Separate function to add logo to banner
function addLogoToBanner() {
  // This function is deprecated and kept for backward compatibility only
  console.log("Using the new createSiteLogo function instead")
  createSiteLogo()
}

// Fetch listings from Airtable
function fetchListings() {
  // Fetch all properties but filter out any that don't have required fields
  base("Properties")
    .select({
      view: "Grid view"
    })
    .eachPage(
      function page(records, fetchNextPage) {
        records.forEach((record) => {
          // Skip records that don't have a name or required fields
          if (!record.get("Name") || !record.get("Price")) {
            console.log("Skipping incomplete listing record:", record.id)
            return
          }
          
          const listing = {
            id: record.id,
            name: record.get("Name"),
            price: record.get("Price"),
            meters: record.get("Meters"),
            varas: record.get("Varas"),
            bedrooms: record.get("Bedrooms"),
            bathrooms: record.get("Bathrooms"),
            parking: record.get("Parking"),
            completionDate: record.get("CompletionDate"),
            description: record.get("Description"),
            featuredImage: record.get("FeaturedImage")?.[0]?.url,
            gallery: record.get("Gallery")?.map((img) => img.url) || [],
            videoURL: record.get("VideoURL"),
            location: record.get("Location") || "Luxury Location",
          }
          renderListing(listing)
        })

        fetchNextPage()
      },
      function done(err) {
        if (err) {
          console.error("Error fetching listings:", err)
          document.getElementById("listings").innerHTML = "<p>Error loading listings. Please check the console for more details.</p>"
          return
        }
        
        // If no listings were found
        if (!document.querySelector(".listing-card")) {
          document.getElementById("listings").innerHTML = "<p>No listings found. Please add properties to your Airtable database.</p>"
        }
        
        // Set up event listeners after listings are loaded
        setupEventListeners()
      },
    )
}

// Render a single listing with enhanced design
function renderListing(listing) {
  const listingsContainer = document.getElementById("listings")
  const listingCard = document.createElement("div")
  listingCard.className = "listing-card"
  listingCard.dataset.id = listing.id
  listingCard.dataset.completionDate = listing.completionDate
  
  // Create card with the new design
  listingCard.innerHTML = `
    <div class="property-image" style="background-image: url('${listing.featuredImage || "https://source.unsplash.com/800x600/?property"}');"></div>
    <div class="location-badge"><i class="fas fa-map-marker-alt"></i> ${listing.location || "Luxury Location"}</div>
    <a href="javascript:void(0)" class="explore-button">
      Explore <i class="fas fa-arrow-right"></i>
    </a>
    <div class="property-overlay">
      <h2 class="listing-title">${listing.name || "Unnamed Property"}</h2>
      <div class="listing-price">from $${listing.price ? listing.price.toLocaleString() : "N/A"}</div>
      <div class="listing-features">
        <div class="feature-item">
          <i class="fas fa-bed"></i>
          <span>${listing.bedrooms || 0} bedrooms</span>
        </div>
        <div class="feature-item">
          <i class="fas fa-bath"></i>
          <span>${listing.bathrooms || 0} bathrooms</span>
        </div>
        <div class="feature-item">
          <i class="fas fa-ruler-combined"></i>
          <span>${listing.meters || 0}m² / ${listing.varas || 0}v²</span>
        </div>
        <div class="feature-item">
          <i class="fas fa-car"></i>
          <span>${listing.parking || 0} parking</span>
        </div>
      </div>
    </div>
  `
  
  // Add click event to open modal
  listingCard.addEventListener("click", () => openModal(listing))
  
  // Add special handling for explore button
  const exploreBtn = listingCard.querySelector('.explore-button')
  if (exploreBtn) {
    exploreBtn.addEventListener('click', (e) => {
      e.stopPropagation() // Prevent the card click event
      openModal(listing)
    })
  }
  
  listingsContainer.appendChild(listingCard)
}

// Open enhanced modal with listing details
function openModal(listing) {
  const modal = document.getElementById("modal")
  const modalDetails = document.getElementById("modal-details")

  // Create enhanced modal content
  modalDetails.innerHTML = `
    <div class="modal-gallery">
      <div class="main-image-container">
        <img src="${listing.featuredImage || "https://source.unsplash.com/800x600/?property"}" alt="${listing.name}" class="main-image">
      </div>
      ${listing.gallery && listing.gallery.length > 0 ? 
        `<div class="thumbnail-row">
          ${listing.gallery.map((url, index) => 
            `<img src="${url}" alt="Property view ${index + 1}" class="thumbnail ${index === 0 ? 'active' : ''}" data-index="${index}">`
          ).join("")}
        </div>` : ''}
    </div>
    
    <h2 class="modal-title">${listing.name || "Unnamed Property"}</h2>
    <p class="modal-price">$${listing.price ? listing.price.toLocaleString() : "Price on Request"}</p>
    
    <div class="modal-location">
      <i class="fas fa-map-marker-alt"></i> ${listing.location || "Luxury Location"}
    </div>
    
    <div class="modal-features">
      <div class="modal-feature">
        <span class="feature-label">Area</span>
        <span class="feature-value">${listing.meters || "N/A"} m² / ${listing.varas || "N/A"} v²</span>
      </div>
      <div class="modal-feature">
        <span class="feature-label">Bedrooms</span>
        <span class="feature-value">${listing.bedrooms || "N/A"}</span>
      </div>
      <div class="modal-feature">
        <span class="feature-label">Bathrooms</span>
        <span class="feature-value">${listing.bathrooms || "N/A"}</span>
      </div>
      <div class="modal-feature">
        <span class="feature-label">Parking</span>
        <span class="feature-value">${listing.parking || "N/A"}</span>
      </div>
      <div class="modal-feature">
        <span class="feature-label">Completion</span>
        <span class="feature-value">${listing.completionDate || "Ready"}</span>
      </div>
    </div>
    
    <div class="modal-description">
      <h3>About This Property</h3>
      <p>${listing.description || "No description available."}</p>
    </div>
    
    ${listing.videoURL ? 
      `<div class="modal-additional">
        <h3>Property Tour</h3>
        <div class="video-container">
          <iframe 
            src="${processVideoUrl(listing.videoURL)}" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
          </iframe>
        </div>
      </div>` 
      : ""}
      
    <div class="modal-actions">
      <button class="action-button book-tour-btn"><i class="fas fa-calendar-alt"></i> Book a Tour</button>
      <button class="action-button contact-btn"><i class="fas fa-phone"></i> Contact Agent</button>
    </div>
  `
  
  // Add event listeners to the buttons
  setTimeout(() => {
    const bookTourBtn = modalDetails.querySelector('.book-tour-btn')
    const contactBtn = modalDetails.querySelector('.contact-btn')
    
    if (bookTourBtn) {
      bookTourBtn.addEventListener('click', () => {
        alert('Tour booking functionality will be implemented here')
      })
    }
    
    if (contactBtn) {
      contactBtn.addEventListener('click', () => {
        alert('Contact agent functionality will be implemented here')
      })
    }
    
    // Set up thumbnail gallery functionality
    const thumbnails = modalDetails.querySelectorAll('.thumbnail')
    const mainImage = modalDetails.querySelector('.main-image')
    if (thumbnails.length > 0 && mainImage) {
      thumbnails.forEach(thumb => {
        thumb.addEventListener('click', () => {
          // Update main image
          mainImage.src = thumb.src
          
          // Update active state
          thumbnails.forEach(t => t.classList.remove('active'))
          thumb.classList.add('active')
        })
      })
    }
  }, 100)

  modal.style.display = "block"
}

// Set up all event listeners
function setupEventListeners() {
  // Close modal button
  const closeButton = document.querySelector(".close-button")
  if (closeButton) {
    closeButton.addEventListener("click", () => {
      document.getElementById("modal").style.display = "none"
    })
  }

  // Close modal when clicking outside
  window.addEventListener("click", (event) => {
    const modal = document.getElementById("modal")
    if (event.target === modal) {
      modal.style.display = "none"
    }
  })

  // FAQ toggles
  const faqQuestions = document.querySelectorAll('.faq-question')
  faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
      const item = question.parentElement
      item.classList.toggle('faq-active')
    })
  })

  // Subscription form
  const subscriptionForm = document.querySelector('.subscription-form')
  if (subscriptionForm) {
    subscriptionForm.addEventListener('submit', (e) => {
      e.preventDefault()
      const emailInput = subscriptionForm.querySelector('input')
      if (emailInput && emailInput.value && isValidEmail(emailInput.value)) {
        alert('Thank you for subscribing! You will receive exclusive updates shortly.')
        emailInput.value = ''
      } else {
        alert('Please enter a valid email address.')
      }
    })
  }
  
  // Filter toggle for mobile
  const filterContainer = document.querySelector('.filters')
  if (filterContainer && window.innerWidth < 768) {
    const toggleHeader = document.createElement('div')
    toggleHeader.className = 'filter-toggle'
    toggleHeader.innerHTML = '<h3>Filter Properties <i class="fas fa-filter"></i></h3>'
    filterContainer.prepend(toggleHeader)
    
    const filterContent = document.querySelector('.filter-container')
    if (filterContent) {
      filterContent.style.display = 'none'
      
      toggleHeader.addEventListener('click', () => {
        const isVisible = filterContent.style.display !== 'none'
        filterContent.style.display = isVisible ? 'none' : 'flex'
        toggleHeader.querySelector('i').className = isVisible 
          ? 'fas fa-filter' 
          : 'fas fa-times'
      })
    }
  }
}

// Filter listings based on criteria
function filterListings() {
  const name = document.getElementById("name").value.toLowerCase()
  const meters = Number.parseInt(document.getElementById("meters").value) || 0
  const varas = Number.parseInt(document.getElementById("varas").value) || 0
  const bedrooms = document.getElementById("bedrooms").value
  const bathrooms = document.getElementById("bathrooms").value
  const parking = document.getElementById("parking").value
  const completionDate = document.getElementById("completionDate").value
  const price = document.getElementById("price").value

  const listingCards = document.querySelectorAll(".listing-card")
  let hasVisibleListings = false

  listingCards.forEach((card) => {
    const cardName = card.querySelector(".listing-title").textContent.toLowerCase()
    const cardPriceText = card.querySelector(".listing-price").textContent.replace(/[^0-9.-]+/g, "")
    const cardPrice = Number.parseInt(cardPriceText) || 0
    
    // Get features info - need to be careful with the selectors to match the new structure
    const featureItems = card.querySelectorAll(".feature-item")
    
    // Extract values using the content after the icon element
    const cardBedrooms = Number.parseInt(featureItems[0]?.textContent.match(/\d+/) || 0)
    const cardBathrooms = Number.parseInt(featureItems[1]?.textContent.match(/\d+/) || 0)
    
    // Extract meters/varas from the third feature item
    let cardMeters = 0, cardVaras = 0
    const areaText = featureItems[2]?.textContent || ""
    const areaParts = areaText.split('/')
    if (areaParts.length >= 2) {
      cardMeters = Number.parseInt(areaParts[0].match(/\d+/) || 0)
      cardVaras = Number.parseInt(areaParts[1].match(/\d+/) || 0)
    }
    
    const cardParking = Number.parseInt(featureItems[3]?.textContent.match(/\d+/) || 0)
    
    // Check for completion date from the dataset attribute
    const cardCompletionDate = card.dataset.completionDate || ""

    // Match all filter criteria
    const nameMatch = !name || cardName.includes(name)
    const metersMatch = cardMeters >= meters
    const varasMatch = cardVaras >= varas
    const bedroomsMatch = !bedrooms || cardBedrooms >= Number.parseInt(bedrooms)
    const bathroomsMatch = !bathrooms || cardBathrooms >= Number.parseInt(bathrooms)
    const parkingMatch = !parking || cardParking >= Number.parseInt(parking)
    const completionDateMatch = !completionDate || cardCompletionDate.includes(completionDate)

    let priceMatch = true
    if (price) {
      const [minPrice, maxPrice] = price.split("-").map(val => Number.parseInt(val) || 0)
      if (maxPrice) {
        priceMatch = cardPrice >= minPrice && cardPrice <= maxPrice
      } else {
        priceMatch = cardPrice >= minPrice
      }
    }

    // Show or hide card based on all criteria
    if (
      nameMatch &&
      metersMatch &&
      varasMatch &&
      bedroomsMatch &&
      bathroomsMatch &&
      parkingMatch &&
      completionDateMatch &&
      priceMatch
    ) {
      card.style.display = ""
      hasVisibleListings = true
    } else {
      card.style.display = "none"
    }
  })
  
  // Show a message if no listings match the filters
  const noResultsMessage = document.getElementById("no-results-message")
  if (!hasVisibleListings) {
    if (!noResultsMessage) {
      const message = document.createElement("p")
      message.id = "no-results-message"
      message.textContent = "No listings match your search criteria. Try adjusting your filters."
      message.style.textAlign = "center"
      message.style.padding = "30px"
      message.style.gridColumn = "1 / -1"
      
      const listingsContainer = document.getElementById("listings")
      listingsContainer.appendChild(message)
    }
  } else if (noResultsMessage) {
    noResultsMessage.remove()
  }
}

// Helper function for email validation
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

// Helper function to properly format video URLs
function processVideoUrl(url) {
  if (!url) return '';
  
  // Handle YouTube URLs
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    // Extract video ID
    let videoId = '';
    
    if (url.includes('youtube.com/watch')) {
      // Format: https://www.youtube.com/watch?v=VIDEO_ID
      const urlParams = new URLSearchParams(url.split('?')[1]);
      videoId = urlParams.get('v');
    } else if (url.includes('youtu.be/')) {
      // Format: https://youtu.be/VIDEO_ID
      videoId = url.split('youtu.be/')[1].split('?')[0];
    } else if (url.includes('youtube.com/embed/')) {
      // Format: https://www.youtube.com/embed/VIDEO_ID
      videoId = url.split('youtube.com/embed/')[1].split('?')[0];
    }
    
    if (videoId) {
      // Return proper embed URL
      return `https://www.youtube.com/embed/${videoId}?rel=0`;
    }
  }
  
  // Handle Vimeo URLs
  if (url.includes('vimeo.com')) {
    // Extract Vimeo ID
    const vimeoId = url.split('vimeo.com/')[1]?.split('?')[0];
    
    if (vimeoId) {
      return `https://player.vimeo.com/video/${vimeoId}`;
    }
  }
  
  // If URL is already an embed URL or we couldn't process it
  return url;
}

// Add event listeners to filter inputs
document.addEventListener("DOMContentLoaded", function() {
  // Create site logo
  createSiteLogo();
  
  // Filter event listeners
  const filterElements = [
    { id: "name", event: "input" },
    { id: "meters", event: "input" },
    { id: "varas", event: "input" },
    { id: "bedrooms", event: "change" },
    { id: "bathrooms", event: "change" },
    { id: "parking", event: "change" },
    { id: "completionDate", event: "change" },
    { id: "price", event: "change" }
  ]
  
  filterElements.forEach(filter => {
    const element = document.getElementById(filter.id)
    if (element) {
      element.addEventListener(filter.event, filterListings)
    }
  })
  
  // Initialize the page
  fetchBannerSettings()
  fetchListings()
})

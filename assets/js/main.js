// API Base URL - can be configured via window.API_BASE_URL or defaults to localhost
const API_BASE_URL = window.API_BASE_URL || 'http://localhost:5000/api';

// Fetch services from API
async function fetchServices() {
	try {
		const response = await fetch(`${API_BASE_URL}/services`);
		const result = await response.json();
		if (result.success) {
			return result.data;
		}
		return null;
	} catch (error) {
		console.error('Error fetching services:', error);
		return null;
	}
}

// Populate service dropdowns
async function populateServiceDropdowns() {
	const services = await fetchServices();
	if (!services) return;

	// Get all service select elements
	const serviceSelects = document.querySelectorAll('select[name="service"]');
	
	serviceSelects.forEach(select => {
		// Clear existing options except the first one
		const firstOption = select.querySelector('option[value=""]') || select.firstElementChild;
		select.innerHTML = '';
		if (firstOption) {
			select.appendChild(firstOption);
		}

		// Add AMC services
		if (services.amc && services.amc.length > 0) {
			const amcGroup = document.createElement('optgroup');
			amcGroup.label = 'AMC Services';
			services.amc.forEach(service => {
				const option = document.createElement('option');
				option.value = service.name;
				option.textContent = `${service.name} - ${service.price}`;
				option.dataset.price = service.price;
				option.dataset.basePrice = service.basePrice || 0;
				amcGroup.appendChild(option);
			});
			select.appendChild(amcGroup);
		}

		// Add Home IT services
		if (services.homeIT && services.homeIT.length > 0) {
			const homeITGroup = document.createElement('optgroup');
			homeITGroup.label = 'Home IT Services';
			services.homeIT.forEach(service => {
				const option = document.createElement('option');
				option.value = service.name;
				option.textContent = `${service.name} - ${service.price}`;
				option.dataset.price = service.price;
				option.dataset.basePrice = service.basePrice || 0;
				homeITGroup.appendChild(option);
			});
			select.appendChild(homeITGroup);
		}
	});
}

document.addEventListener('DOMContentLoaded', () => {
	// Set current year in footer
	const yearEl = document.getElementById('year');
	if (yearEl) yearEl.textContent = String(new Date().getFullYear());

	// Mark active nav by matching current path
	const current = location.pathname.split('/').pop() || 'index.html';
	document.querySelectorAll('.navbar .nav-link').forEach(link => {
		const href = link.getAttribute('href');
		if (!href) return;
		if (href === current) {
			link.classList.add('active');
		}
	});

	// Fetch and populate services
	populateServiceDropdowns();

	// Newsletter dummy handler
	document.querySelectorAll('#newsletterForm').forEach(form => {
		form.addEventListener('submit', e => {
			e.preventDefault();
			alert('Thanks for subscribing! You will receive our next newsletter.');
			form.reset();
		});
	});

	// Quick booking: forward to booking with prefilled query params
	const quickBooking = document.getElementById('quickBookingForm');
	if (quickBooking) {
		quickBooking.addEventListener('submit', e => {
			e.preventDefault();
			const data = new FormData(quickBooking);
			const params = new URLSearchParams({
				name: String(data.get('name') || ''),
				phone: String(data.get('phone') || ''),
				service: String(data.get('service') || '')
			});
			location.href = `booking.html?${params.toString()}`;
		});
	}

	// Booking form: prefill from query and assign nearest staff
	const bookingForm = document.getElementById('bookingForm');
	if (bookingForm) {
		// Prefill fields from URL
		const qs = new URLSearchParams(location.search);
		['name','phone','service'].forEach(key => {
			const val = qs.get(key);
			if (val && bookingForm[key]) bookingForm[key].value = val;
		});

		const assignedTechEl = document.getElementById('assignedTech');
		const cityToTech = {
			'Haldwani': ['Vinod Singh Mehra', 'Manoj Singh Danu'],
			'Bhimtal': ['Mohit Negi'],
			'Nainital': ['Pankaj Negi'],
			'Rudrapur': ['Ravi Kumar', 'Priya Shah'],
			'Bageshwar': ['Arjun Patel'],
			'Almoda': ['Neha Singh']
		};
		const pickNearest = (city) => {
			const list = cityToTech[city] || [];
			if (list.length === 0) return null;
			return list[Math.floor(Math.random() * list.length)];
		};

		bookingForm.city.addEventListener('change', () => {
			const tech = pickNearest(bookingForm.city.value);
			if (tech && assignedTechEl) {
				assignedTechEl.classList.remove('d-none');
				assignedTechEl.textContent = `Nearest available technician for ${bookingForm.city.value}: ${tech}`;
			} else if (assignedTechEl) {
				assignedTechEl.classList.add('d-none');
			}
		});

		bookingForm.addEventListener('submit', async e => {
			e.preventDefault();
			const submitBtn = bookingForm.querySelector('button[type="submit"]');
			const originalText = submitBtn ? submitBtn.innerHTML : '';
			
			if (submitBtn) {
				submitBtn.disabled = true;
				submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i>Processing...';
			}

			try {
				const formData = new FormData(bookingForm);
				const activeTab = document.querySelector('#paymentTab .nav-link.active');
				const paymentMethod = activeTab ? activeTab.textContent.trim() : 'Cash on Delivery';
				
				const bookingData = {
					name: formData.get('name'),
					phone: formData.get('phone'),
					email: formData.get('email'),
					city: formData.get('city'),
					address: formData.get('address'),
					serviceType: formData.get('service'),
					preferredDate: formData.get('date'),
					preferredTime: formData.get('time'),
					paymentMethod: paymentMethod
				};

				const response = await fetch(`${API_BASE_URL}/book-service`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(bookingData)
				});

				const result = await response.json();

				if (result.success) {
					const bookingId = result.data._id;
					
					// If online payment selected, handle payment
					if (paymentMethod.toLowerCase().includes('online') || paymentMethod.toLowerCase().includes('card') || paymentMethod.toLowerCase().includes('upi')) {
						// Get base price from selected service
						const serviceSelect = bookingForm.querySelector('select[name="service"]');
						const selectedOption = serviceSelect?.options[serviceSelect.selectedIndex];
						const basePrice = parseFloat(selectedOption?.dataset.basePrice) || 0;
						
						if (basePrice > 0) {
							// Redirect to payment or show payment modal
							handleOnlinePayment(bookingId, basePrice, bookingData.name);
							return;
						}
					}
					
					alert(`✅ Thanks ${bookingData.name}! Your booking is confirmed. Booking ID: ${bookingId?.slice(-8) || 'N/A'}`);
					bookingForm.reset();
					if (assignedTechEl) assignedTechEl.classList.add('d-none');
					window.scrollTo({ top: 0, behavior: 'smooth' });
				} else {
					alert(`❌ Error: ${result.message || 'Failed to create booking'}`);
				}
			} catch (error) {
				console.error('Booking error:', error);
				alert(`❌ Error: Could not connect to server. Please ensure the backend is running.`);
			} finally {
				if (submitBtn) {
					submitBtn.disabled = false;
					submitBtn.innerHTML = originalText;
				}
			}
		});
	}

	// Handle online payment
	async function handleOnlinePayment(bookingId, amount, customerName) {
		try {
			// Create payment order
			const response = await fetch(`${API_BASE_URL}/payment/create-order`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ bookingId, amount })
			});

			const result = await response.json();

			if (result.success && result.data.key) {
				// Razorpay is configured
				initiateRazorpayPayment(result.data, bookingId, customerName);
			} else {
				// Razorpay not configured, show manual payment message
				alert(`✅ Booking confirmed! Payment of ₹${amount} can be made via Cash on Delivery or contact us for online payment options.`);
			}
		} catch (error) {
			console.error('Payment error:', error);
			alert(`✅ Booking confirmed! Please contact us for payment options.`);
		}
	}

	// Initialize Razorpay payment
	function initiateRazorpayPayment(paymentData, bookingId, customerName) {
		if (typeof Razorpay === 'undefined') {
			// Load Razorpay script if not loaded
			const script = document.createElement('script');
			script.src = 'https://checkout.razorpay.com/v1/checkout.js';
			script.onload = () => {
				openRazorpayCheckout(paymentData, bookingId, customerName);
			};
			document.body.appendChild(script);
		} else {
			openRazorpayCheckout(paymentData, bookingId, customerName);
		}
	}

	function openRazorpayCheckout(paymentData, bookingId, customerName) {
		const options = {
			key: paymentData.key,
			amount: paymentData.amount * 100, // Convert to paise
			currency: paymentData.currency || 'INR',
			name: 'TechCare Pro360',
			description: `Booking Payment - ${customerName}`,
			order_id: paymentData.orderId,
			handler: async function(response) {
				// Verify payment
				try {
					const verifyResponse = await fetch(`${API_BASE_URL}/payment/verify`, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							razorpay_order_id: response.razorpay_order_id,
							razorpay_payment_id: response.razorpay_payment_id,
							razorpay_signature: response.razorpay_signature,
							paymentId: paymentData.paymentId
						})
					});

					const verifyResult = await verifyResponse.json();

					if (verifyResult.success) {
						alert(`✅ Payment successful! Your booking is confirmed. Booking ID: ${bookingId?.slice(-8) || 'N/A'}`);
						if (bookingForm) {
							bookingForm.reset();
							if (assignedTechEl) assignedTechEl.classList.add('d-none');
						}
						window.scrollTo({ top: 0, behavior: 'smooth' });
					} else {
						alert(`❌ Payment verification failed: ${verifyResult.message || 'Please contact support'}`);
					}
				} catch (error) {
					console.error('Payment verification error:', error);
					alert(`⚠️ Payment received but verification pending. Please contact support with Payment ID: ${response.razorpay_payment_id}`);
				}
			},
			prefill: {
				name: customerName
			},
			theme: {
				color: '#3b82f6'
			}
		};

		const rzp = new Razorpay(options);
		rzp.open();
	}

	// Contact form handler
	const contactForm = document.getElementById('contactForm');
	if (contactForm) {
		contactForm.addEventListener('submit', async e => {
			e.preventDefault();
			const submitBtn = contactForm.querySelector('button[type="submit"]');
			const originalText = submitBtn ? submitBtn.innerHTML : '';
			
			if (submitBtn) {
				submitBtn.disabled = true;
				submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i>Sending...';
			}

			try {
				const formData = new FormData(contactForm);
				const contactData = {
					name: formData.get('name'),
					phone: formData.get('phone') || '',
					email: formData.get('email'),
					subject: formData.get('subject'),
					message: formData.get('message')
				};

				const response = await fetch(`${API_BASE_URL}/contact`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(contactData)
				});

				const result = await response.json();

				if (result.success) {
					alert('✅ Your message has been sent successfully. We will get back to you shortly.');
					contactForm.reset();
				} else {
					alert(`❌ Error: ${result.message || 'Failed to send message'}`);
				}
			} catch (error) {
				console.error('Contact error:', error);
				alert(`❌ Error: Could not connect to server. Please ensure the backend is running.`);
			} finally {
				if (submitBtn) {
					submitBtn.disabled = false;
					submitBtn.innerHTML = originalText;
				}
			}
		});
	}
});



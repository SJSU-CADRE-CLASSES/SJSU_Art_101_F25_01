// SJSU Garage Overcrowding Visualization
class GarageVisualizer {
    constructor() {
        this.garages = {
            north: { capacity: 500, current: 0 },
            south: { capacity: 400, current: 0 },
            'south-campus': { capacity: 600, current: 0 },
            west: { capacity: 350, current: 0 }
        };
        
        this.currentTime = 8;
        this.currentDay = 1; // Monday
        this.isAnimating = false;
        this.animationInterval = null;
        
        this.initializeEventListeners();
        this.generateParkingSpots();
        this.updateVisualization();
    }

    initializeEventListeners() {
        // Time slider
        const timeSlider = document.getElementById('timeSlider');
        const timeDisplay = document.getElementById('timeDisplay');
        
        timeSlider.addEventListener('input', (e) => {
            this.currentTime = parseInt(e.target.value);
            this.updateTimeDisplay();
            this.updateVisualization();
        });

        // Day selector
        const daySelector = document.getElementById('daySelector');
        daySelector.addEventListener('change', (e) => {
            this.currentDay = parseInt(e.target.value);
            this.updateVisualization();
        });

        // Animate button
        const animateBtn = document.getElementById('animateBtn');
        animateBtn.addEventListener('click', () => {
            if (this.isAnimating) {
                this.stopAnimation();
            } else {
                this.startAnimation();
            }
        });

        // Add click events to parking spots for interactivity
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('parking-spot')) {
                this.toggleParkingSpot(e.target);
            }
        });
    }

    generateParkingSpots() {
        Object.keys(this.garages).forEach(garageId => {
            const garage = document.querySelector(`[data-garage="${garageId}"]`);
            const parkingSpotsContainer = garage.querySelector('.parking-spots');
            
            // Clear existing spots
            parkingSpotsContainer.innerHTML = '';
            
            // Generate parking spots based on capacity
            const capacity = this.garages[garageId].capacity;
            const spotsPerRow = 10;
            const rows = Math.ceil(capacity / spotsPerRow);
            
            for (let i = 0; i < capacity; i++) {
                const spot = document.createElement('div');
                spot.className = 'parking-spot available';
                spot.dataset.index = i;
                spot.dataset.garage = garageId;
                parkingSpotsContainer.appendChild(spot);
            }
        });
    }

    updateTimeDisplay() {
        const timeDisplay = document.getElementById('timeDisplay');
        const hour = this.currentTime;
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : (hour > 12 ? hour - 12 : hour);
        timeDisplay.textContent = `${displayHour}:00 ${ampm}`;
    }

    updateVisualization() {
        // Calculate occupancy based on time and day
        this.calculateOccupancy();
        
        // Update parking spots visualization
        this.updateParkingSpots();
        
        // Update statistics
        this.updateStatistics();
        
        // Update capacity displays
        this.updateCapacityDisplays();
    }

    calculateOccupancy() {
        Object.keys(this.garages).forEach(garageId => {
            const garage = this.garages[garageId];
            const baseOccupancy = this.getBaseOccupancy(garageId);
            const timeMultiplier = this.getTimeMultiplier();
            const dayMultiplier = this.getDayMultiplier();
            
            // Calculate current occupancy with realistic patterns
            let occupancy = Math.floor(baseOccupancy * timeMultiplier * dayMultiplier);
            
            // Add some randomness for realism
            occupancy += Math.floor(Math.random() * 20) - 10;
            
            // Ensure occupancy is within bounds
            occupancy = Math.max(0, Math.min(garage.capacity, occupancy));
            
            garage.current = occupancy;
        });
    }

    getBaseOccupancy(garageId) {
        // Different garages have different base occupancy rates
        const baseRates = {
            north: 0.4, // 40% base occupancy
            south: 0.5, // 50% base occupancy
            'south-campus': 0.6, // 60% base occupancy (most popular)
            west: 0.3  // 30% base occupancy
        };
        
        return Math.floor(this.garages[garageId].capacity * baseRates[garageId]);
    }

    getTimeMultiplier() {
        // Peak times: 8-10 AM and 2-4 PM
        if (this.currentTime >= 8 && this.currentTime <= 10) {
            return 1.8; // 80% increase during morning peak
        } else if (this.currentTime >= 14 && this.currentTime <= 16) {
            return 1.6; // 60% increase during afternoon peak
        } else if (this.currentTime >= 11 && this.currentTime <= 13) {
            return 1.2; // 20% increase during lunch
        } else if (this.currentTime >= 18 || this.currentTime <= 6) {
            return 0.3; // 70% decrease during evening/night
        } else {
            return 0.8; // 20% decrease during other times
        }
    }

    getDayMultiplier() {
        // Weekdays are busier than weekends
        if (this.currentDay >= 1 && this.currentDay <= 5) {
            return 1.0; // Full weekday occupancy
        } else if (this.currentDay === 6) {
            return 0.4; // Saturday - 40% occupancy
        } else {
            return 0.2; // Sunday - 20% occupancy
        }
    }

    updateParkingSpots() {
        Object.keys(this.garages).forEach(garageId => {
            const garage = document.querySelector(`[data-garage="${garageId}"]`);
            const spots = garage.querySelectorAll('.parking-spot');
            const currentOccupancy = this.garages[garageId].current;
            const capacity = this.garages[garageId].capacity;
            
            spots.forEach((spot, index) => {
                spot.className = 'parking-spot';
                
                if (index < currentOccupancy) {
                    // Check if overcrowded (over 90% capacity)
                    if (currentOccupancy / capacity > 0.9) {
                        spot.classList.add('overcrowded');
                    } else {
                        spot.classList.add('occupied');
                    }
                } else {
                    spot.classList.add('available');
                }
            });
        });
    }

    updateStatistics() {
        const totalCars = Object.values(this.garages).reduce((sum, garage) => sum + garage.current, 0);
        const totalCapacity = Object.values(this.garages).reduce((sum, garage) => sum + garage.capacity, 0);
        const occupancyRate = Math.round((totalCars / totalCapacity) * 100);
        
        // Update stats display
        document.getElementById('totalCars').textContent = totalCars;
        document.getElementById('occupancyRate').textContent = `${occupancyRate}%`;
        
        // Update stress level based on occupancy
        let stressLevel = '😌';
        if (occupancyRate > 90) stressLevel = '😱';
        else if (occupancyRate > 80) stressLevel = '😰';
        else if (occupancyRate > 60) stressLevel = '😐';
        else if (occupancyRate > 40) stressLevel = '🙂';
        
        document.getElementById('stressLevel').textContent = stressLevel;
        
        // Update peak time
        const peakTime = this.getPeakTime();
        document.getElementById('peakTime').textContent = peakTime;
    }

    getPeakTime() {
        if (this.currentTime >= 8 && this.currentTime <= 10) {
            return 'Morning Peak';
        } else if (this.currentTime >= 14 && this.currentTime <= 16) {
            return 'Afternoon Peak';
        } else if (this.currentTime >= 11 && this.currentTime <= 13) {
            return 'Lunch Rush';
        } else if (this.currentTime >= 18 || this.currentTime <= 6) {
            return 'Quiet Hours';
        } else {
            return 'Normal';
        }
    }

    updateCapacityDisplays() {
        Object.keys(this.garages).forEach(garageId => {
            const garage = document.querySelector(`[data-garage="${garageId}"]`);
            const currentSpan = garage.querySelector('.capacity-info .current');
            currentSpan.textContent = this.garages[garageId].current;
        });
    }

    toggleParkingSpot(spot) {
        // Interactive feature: click to toggle spot status
        const garageId = spot.dataset.garage;
        const index = parseInt(spot.dataset.index);
        
        if (spot.classList.contains('available')) {
            // Make it occupied
            spot.classList.remove('available');
            spot.classList.add('occupied');
            this.garages[garageId].current++;
        } else if (spot.classList.contains('occupied')) {
            // Make it available
            spot.classList.remove('occupied');
            spot.classList.add('available');
            this.garages[garageId].current--;
        }
        
        this.updateStatistics();
        this.updateCapacityDisplays();
    }

    startAnimation() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        const animateBtn = document.getElementById('animateBtn');
        animateBtn.textContent = '⏸️ Stop Animation';
        animateBtn.style.background = 'linear-gradient(45deg, #ff4757, #ff6b6b)';
        
        this.animationInterval = setInterval(() => {
            this.currentTime = (this.currentTime + 1) % 24;
            
            // Update time slider
            const timeSlider = document.getElementById('timeSlider');
            timeSlider.value = this.currentTime;
            
            this.updateTimeDisplay();
            this.updateVisualization();
            
            // Add some visual feedback
            this.addAnimationEffects();
            
        }, 1000); // Update every second
    }

    stopAnimation() {
        if (!this.isAnimating) return;
        
        this.isAnimating = false;
        const animateBtn = document.getElementById('animateBtn');
        animateBtn.textContent = '🎬 Animate Day';
        animateBtn.style.background = 'linear-gradient(45deg, #ff6b6b, #4ecdc4)';
        
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = null;
        }
        
        // Remove animation effects
        this.removeAnimationEffects();
    }

    addAnimationEffects() {
        // Add pulsing effect to overcrowded garages
        Object.keys(this.garages).forEach(garageId => {
            const garage = document.querySelector(`[data-garage="${garageId}"]`);
            const capacity = this.garages[garageId].capacity;
            const current = this.garages[garageId].current;
            
            if (current / capacity > 0.9) {
                garage.style.animation = 'pulse 0.5s ease-in-out';
            }
        });
    }

    removeAnimationEffects() {
        Object.keys(this.garages).forEach(garageId => {
            const garage = document.querySelector(`[data-garage="${garageId}"]`);
            garage.style.animation = '';
        });
    }
}

// Initialize the visualization when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const visualizer = new GarageVisualizer();
    
    // Add some initial interactivity
    console.log('🚗 SJSU Garage Overcrowding Visualization Loaded!');
    console.log('💡 Tip: Click on parking spots to manually adjust occupancy');
    console.log('🎬 Use the animate button to see how parking changes throughout the day');
});

// Add some fun Easter eggs
document.addEventListener('keydown', (e) => {
    if (e.key === 'p' || e.key === 'P') {
        // Press P to toggle panic mode
        document.body.style.animation = 'pulse 0.2s ease-in-out';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 200);
    }
});

// Add smooth scrolling for better UX
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

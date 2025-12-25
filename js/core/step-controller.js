/**
 * Step Controller
 * Manages UI step transitions and view switching
 * 
 * @module core/step-controller
 */

import { appState } from './app-state.js';

/**
 * Step definitions
 */
const STEPS = {
    selection: {
        id: 'step-selection',
        title: '스프레드 선택'
    },
    ritual: {
        id: 'step-ritual',
        title: '엔트로피 수집'
    },
    reveal: {
        id: 'step-reveal',
        title: '카드 공개'
    },
    reading: {
        id: 'step-reading',
        title: '리딩 결과'
    }
};

/**
 * Step Controller class
 */
export class StepController {
    constructor() {
        this.containers = {};
        this.currentStep = 'selection';

        // Subscribe to state changes
        appState.subscribe('currentStep', (newStep) => {
            this.transitionTo(newStep);
        });
    }

    /**
     * Initialize with DOM containers
     * @param {Object} containers - Map of step names to DOM elements
     */
    init(containers) {
        this.containers = containers;
        this.transitionTo('selection');
    }

    /**
     * Register a container for a step
     * @param {string} step - Step name
     * @param {HTMLElement} element - Container element
     */
    registerContainer(step, element) {
        this.containers[step] = element;
    }

    /**
     * Transition to a new step
     * @param {string} step - Target step name
     */
    transitionTo(step) {
        if (!STEPS[step]) {
            console.warn(`Unknown step: ${step}`);
            return;
        }

        // Hide all containers
        Object.values(this.containers).forEach(container => {
            if (container) {
                container.classList.add('hidden');
                container.classList.remove('flex');
            }
        });

        // Show target container
        const targetContainer = this.containers[step];
        if (targetContainer) {
            targetContainer.classList.remove('hidden');

            // Special handling for reveal step (flex layout)
            if (step === 'reveal') {
                targetContainer.classList.add('flex');
            }

            // Add fade-in animation
            targetContainer.classList.add('fade-in');
        }

        this.currentStep = step;
    }

    /**
     * Get current step info
     * @returns {Object}
     */
    getCurrentStep() {
        return {
            name: this.currentStep,
            ...STEPS[this.currentStep]
        };
    }

    /**
     * Check if on specific step
     * @param {string} step - Step name
     * @returns {boolean}
     */
    isStep(step) {
        return this.currentStep === step;
    }
}

// Singleton instance
export const stepController = new StepController();

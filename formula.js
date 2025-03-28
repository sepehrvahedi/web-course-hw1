class FormulaEvaluator {
    constructor(formulaElement) {
        this.formulaElement = formulaElement;
        this.formula = formulaElement.getAttribute('evaluator');
        this.inputIds = this.extractInputIds();
        this.resultElement = this.createResultElement();

        this.formulaElement.parentNode.replaceChild(this.resultElement, this.formulaElement);

        this.setupEventListeners();

        this.evaluateFormula();
    }

    extractInputIds() {
        const possibleIds = this.formula.match(/[a-zA-Z_][a-zA-Z0-9_]*/g) || [];

        return possibleIds.filter(id => document.getElementById(id));
    }

    createResultElement() {
        const resultElement = document.createElement('input');
        resultElement.type = 'text';
        resultElement.readOnly = true;
        resultElement.className = 'formula-result';
        return resultElement;
    }

    setupEventListeners() {
        this.inputIds.forEach(id => {
            const inputElement = document.getElementById(id);
            if (inputElement) {
                inputElement.addEventListener('input', () => this.evaluateFormula());
            }
        });
    }

    evaluateFormula() {
        try {
            const values = {};
            let allValid = true;

            this.inputIds.forEach(id => {
                const inputElement = document.getElementById(id);
                if (inputElement) {
                    const value = inputElement.value.trim() === '' ? 0 : parseFloat(inputElement.value);
                    values[id] = isNaN(value) ? 0 : value;
                } else {
                    allValid = false;
                }
            });

            if (!allValid) {
                this.resultElement.value = 'Invalid Formula';
                return;
            }

            let evaluableExpression = this.formula;
            for (const id in values) {
                const regex = new RegExp('\\b' + id + '\\b', 'g');
                evaluableExpression = evaluableExpression.replace(regex, values[id]);
            }

            const result = eval(evaluableExpression);
            this.resultElement.value = isNaN(result) ? 'Invalid Formula' : result.toLocaleString('fa-IR');
        } catch (error) {
            console.error('Error evaluating formula:', error);
            this.resultElement.value = 'Invalid Formula';
        }
    }
}

class FormulasManager {
    constructor() {
        this.formulaEvaluators = [];
        this.init();
    }
    init() {
        const formulaElements = document.querySelectorAll('formula');

        formulaElements.forEach(formulaElement => {
            const evaluator = new FormulaEvaluator(formulaElement);
            this.formulaEvaluators.push(evaluator);
        });
    }
}

class ThemeManager {
    constructor() {
        this.toggleButton = document.getElementById('theme-toggle');
        this.htmlElement = document.documentElement;
        this.init();
    }

    init() {
        const savedTheme = localStorage.getItem('theme');

        if (savedTheme === 'dark') {
            this.htmlElement.classList.add('dark-mode');
            this.toggleButton.checked = true;
        }

        this.toggleButton.addEventListener('change', () => this.toggleTheme());
    }

    toggleTheme() {
        this.htmlElement.classList.toggle('dark-mode');

        if (this.htmlElement.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
        } else {
            localStorage.setItem('theme', 'light');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new FormulasManager();
    new ThemeManager();
});

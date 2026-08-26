"use strict";

/* =========================================================
   MODERN CALCULATOR
   Fully upgraded JavaScript
========================================================= */


/* =========================================================
   STATE
========================================================= */

const state = {
    current: "0",
    expression: "",
    firstOperand: null,
    operator: null,

    previousAnswer: 0,
    memory: 0,

    justCalculated: false,
    waitingForOperand: false,

    angleMode: "DEG",

    history: [],

    scientificMode: false
};


/* =========================================================
   DOM ELEMENTS
========================================================= */

const resultDisplay =
    document.getElementById("resultDisplay");

const expressionDisplay =
    document.getElementById("expressionDisplay");

const statusMessage =
    document.getElementById("statusMessage");

const memoryIndicator =
    document.getElementById("memoryIndicator");

const scientificPanel =
    document.getElementById("scientificPanel");

const basicMode =
    document.getElementById("basicMode");

const scientificModeButton =
    document.getElementById("scientificMode");

const themeButton =
    document.getElementById("themeButton");

const historyButton =
    document.getElementById("historyButton");

const historyPanel =
    document.getElementById("historyPanel");

const closeHistory =
    document.getElementById("closeHistory");

const historyList =
    document.getElementById("historyList");

const copyResult =
    document.getElementById("copyResult");

const clearAllHistory =
    document.getElementById("clearAllHistory");

const toast =
    document.getElementById("toast");


/* =========================================================
   STORAGE KEYS
========================================================= */

const STORAGE = {
    history: "modernCalculatorHistory",
    theme: "modernCalculatorTheme",
    memory: "modernCalculatorMemory",
    angle: "modernCalculatorAngle"
};


/* =========================================================
   INITIALIZATION
========================================================= */

function initializeCalculator() {

    loadHistory();

    loadTheme();

    loadMemory();

    loadAngleMode();

    updateDisplay();

    setStatus("Ready");
}


/* =========================================================
   DISPLAY
========================================================= */

function updateDisplay() {

    resultDisplay.textContent =
        formatNumber(state.current);

    expressionDisplay.textContent =
        state.expression || "0";

    memoryIndicator.classList.toggle(
        "visible",
        state.memory !== 0
    );
}


/* =========================================================
   NUMBER FORMATTING
========================================================= */

function formatNumber(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "0";
    }

    if (value === "Error") {
        return "Error";
    }

    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "Error";
    }

    if (Object.is(number, -0)) {
        return "0";
    }

    if (
        Math.abs(number) >= 1e12 ||
        (
            Math.abs(number) > 0 &&
            Math.abs(number) < 1e-8
        )
    ) {

        return number.toExponential(7);
    }

    return number.toLocaleString(
        "en-US",
        {
            maximumFractionDigits: 10
        }
    );
}


/* =========================================================
   CLEAN NUMBER
========================================================= */

function cleanNumber(number) {

    if (!Number.isFinite(number)) {

        throw new Error(
            "Result is outside the supported range."
        );
    }

    return Number(
        number.toPrecision(12)
    ).toString();
}


/* =========================================================
   STATUS
========================================================= */

function setStatus(message) {

    statusMessage.textContent =
        message;
}


/* =========================================================
   ERROR HANDLING
========================================================= */

function showError(message) {

    state.current = "Error";

    state.expression = message;

    state.firstOperand = null;

    state.operator = null;

    state.justCalculated = true;

    state.waitingForOperand = false;

    setStatus("Error");

    updateDisplay();
}


/* =========================================================
   INPUT NUMBER
========================================================= */

function inputNumber(number) {

    if (state.current === "Error") {

        resetCalculator();

    }

    if (
        state.justCalculated ||
        state.waitingForOperand
    ) {

        state.current = number;

        state.justCalculated = false;

        state.waitingForOperand = false;

    } else if (
        state.current === "0"
    ) {

        state.current = number;

    } else if (
        state.current === "-0"
    ) {

        state.current = "-" + number;

    } else {

        state.current += number;
    }

    updateDisplay();
}


/* =========================================================
   DECIMAL
========================================================= */

function inputDecimal() {

    if (state.current === "Error") {

        resetCalculator();
    }

    if (
        state.justCalculated ||
        state.waitingForOperand
    ) {

        state.current = "0.";

        state.justCalculated = false;

        state.waitingForOperand = false;

        updateDisplay();

        return;
    }

    if (
        !state.current.includes(".")
    ) {

        state.current += ".";
    }

    updateDisplay();
}


/* =========================================================
   TOGGLE SIGN
========================================================= */

function toggleSign() {

    if (
        state.current === "Error"
    ) {
        return;
    }

    if (
        Number(state.current) === 0
    ) {
        return;
    }

    if (
        state.current.startsWith("-")
    ) {

        state.current =
            state.current.substring(1);

    } else {

        state.current =
            "-" + state.current;
    }

    updateDisplay();
}


/* =========================================================
   DELETE
========================================================= */

function deleteLast() {

    if (
        state.current === "Error"
    ) {

        resetCalculator();

        return;
    }

    if (
        state.justCalculated ||
        state.waitingForOperand
    ) {

        return;
    }

    if (
        state.current.length <= 1 ||
        (
            state.current.length === 2 &&
            state.current.startsWith("-")
        )
    ) {

        state.current = "0";

    } else {

        state.current =
            state.current.slice(0, -1);
    }

    updateDisplay();
}


/* =========================================================
   CLEAR
========================================================= */

function resetCalculator() {

    state.current = "0";

    state.expression = "";

    state.firstOperand = null;

    state.operator = null;

    state.justCalculated = false;

    state.waitingForOperand = false;

    setStatus("Ready");

    updateDisplay();
}


/* =========================================================
   PERCENTAGE
========================================================= */

function calculatePercentage() {

    if (
        state.current === "Error"
    ) {
        return;
    }

    const value =
        Number(state.current);

    if (!Number.isFinite(value)) {

        showError(
            "Invalid percentage"
        );

        return;
    }

    state.current =
        cleanNumber(value / 100);

    setStatus("Percentage");

    updateDisplay();
}


/* =========================================================
   OPERATOR
========================================================= */

function chooseOperator(operation) {

    if (
        state.current === "Error"
    ) {
        return;
    }

    const inputValue =
        Number(state.current);

    if (
        state.operator &&
        state.waitingForOperand
    ) {

        state.operator =
            operation;

        state.expression =
            `${formatNumber(state.firstOperand)} ${operatorSymbol(operation)}`;

        updateDisplay();

        return;
    }

    if (
        state.firstOperand !== null &&
        state.operator &&
        !state.waitingForOperand
    ) {

        performPendingCalculation();

    } else {

        state.firstOperand =
            inputValue;
    }

    state.operator =
        operation;

    state.waitingForOperand = true;

    state.justCalculated = false;

    state.expression =
        `${formatNumber(state.firstOperand)} ${operatorSymbol(operation)}`;

    setStatus(
        `${operatorSymbol(operation)} selected`
    );

    updateDisplay();
}


/* =========================================================
   OPERATOR SYMBOLS
========================================================= */

function operatorSymbol(operation) {

    const symbols = {

        "+": "+",

        "-": "−",

        "*": "×",

        "/": "÷",

        "^": "^"
    };

    return symbols[operation] || operation;
}


/* =========================================================
   PENDING CALCULATION
========================================================= */

function performPendingCalculation() {

    if (
        state.firstOperand === null ||
        state.operator === null
    ) {

        return;
    }

    const first =
        Number(state.firstOperand);

    const second =
        Number(state.current);

    let result;


    switch (state.operator) {

        case "+":

            result =
                first + second;

            break;


        case "-":

            result =
                first - second;

            break;


        case "*":

            result =
                first * second;

            break;


        case "/":

            if (second === 0) {

                throw new Error(
                    "Cannot divide by zero."
                );
            }

            result =
                first / second;

            break;


        case "^":

            result =
                Math.pow(
                    first,
                    second
                );

            break;


        default:

            throw new Error(
                "Unknown operator."
            );
    }


    state.current =
        cleanNumber(result);

    state.previousAnswer =
        result;

    return result;
}


/* =========================================================
   EQUALS
========================================================= */

function calculate() {

    if (
        state.current === "Error"
    ) {
        return;
    }


    try {

        /* ---------------------------------------------
           Pending binary operation
        --------------------------------------------- */

        if (
            state.firstOperand !== null &&
            state.operator !== null
        ) {

            const first =
                Number(state.firstOperand);

            const second =
                Number(state.current);

            const operation =
                state.operator;

            const result =
                performPendingCalculation();


            const calculationExpression =
                `${formatNumber(first)} ${operatorSymbol(operation)} ${formatNumber(second)}`;


            saveCalculation(
                calculationExpression,
                result
            );


            state.expression =
                `${calculationExpression} =`;


            state.previousAnswer =
                result;


            state.firstOperand =
                null;

            state.operator =
                null;

            state.waitingForOperand =
                false;

            state.justCalculated =
                true;


            setStatus("Complete");

            updateDisplay();

            return;
        }


        /* ---------------------------------------------
           Scientific / parenthesis expression
        --------------------------------------------- */

        if (
            state.expression &&
            containsComplexExpression(
                state.expression
            )
        ) {

            const result =
                evaluateExpression(
                    state.expression
                );


            saveCalculation(
                state.expression,
                result
            );


            state.current =
                cleanNumber(result);

            state.previousAnswer =
                result;

            state.expression += " =";

            state.justCalculated =
                true;


            setStatus("Complete");

            updateDisplay();

            return;
        }


        state.previousAnswer =
            Number(state.current);

        setStatus("Complete");

        updateDisplay();

    } catch (error) {

        showError(
            error.message
        );
    }
}


/* =========================================================
   COMPLEX EXPRESSION CHECK
========================================================= */

function containsComplexExpression(
    expression
) {

    return (
        expression.includes("(") ||
        expression.includes(")") ||
        expression.includes("^") ||
        expression.includes("π") ||
        expression.includes("Ans")
    );
}


/* =========================================================
   SCIENTIFIC MODE
========================================================= */

function scientificFunction(
    functionName
) {

    if (
        state.current === "Error"
    ) {
        return;
    }


    try {

        const value =
            Number(state.current);

        let result;

        let expression;


        switch (functionName) {

            case "sin":

                result =
                    Math.sin(
                        toRadians(value)
                    );

                expression =
                    `sin(${formatNumber(value)}°)`;

                break;


            case "cos":

                result =
                    Math.cos(
                        toRadians(value)
                    );

                expression =
                    `cos(${formatNumber(value)}°)`;

                break;


            case "tan":

                result =
                    Math.tan(
                        toRadians(value)
                    );

                if (
                    Math.abs(
                        Math.cos(
                            toRadians(value)
                        )
                    ) < 1e-12
                ) {

                    throw new Error(
                        "Tangent is undefined."
                    );
                }

                expression =
                    `tan(${formatNumber(value)}°)`;

                break;


            case "sqrt":

                if (value < 0) {

                    throw new Error(
                        "√ requires a non-negative number."
                    );
                }

                result =
                    Math.sqrt(value);

                expression =
                    `√(${formatNumber(value)})`;

                break;


            case "square":

                result =
                    value * value;

                expression =
                    `(${formatNumber(value)})²`;

                break;


            case "power":

                chooseOperator("^");

                return;


            case "log":

                if (value <= 0) {

                    throw new Error(
                        "log requires a positive number."
                    );
                }

                result =
                    Math.log10(value);

                expression =
                    `log(${formatNumber(value)})`;

                break;


            case "ln":

                if (value <= 0) {

                    throw new Error(
                        "ln requires a positive number."
                    );
                }

                result =
                    Math.log(value);

                expression =
                    `ln(${formatNumber(value)})`;

                break;


            case "factorial":

                if (
                    value < 0 ||
                    !Number.isInteger(value)
                ) {

                    throw new Error(
                        "Factorial requires a non-negative integer."
                    );
                }

                if (value > 170) {

                    throw new Error(
                        "Number is too large."
                    );
                }

                result =
                    factorial(value);

                expression =
                    `${formatNumber(value)}!`;

                break;


            case "reciprocal":

                if (value === 0) {

                    throw new Error(
                        "Cannot divide by zero."
                    );
                }

                result =
                    1 / value;

                expression =
                    `1/(${formatNumber(value)})`;

                break;


            case "pi":

                result =
                    Math.PI;

                expression =
                    "π";

                break;


            case "e":

                result =
                    Math.E;

                expression =
                    "e";

                break;


            case "ans":

                result =
                    state.previousAnswer;

                expression =
                    "Ans";

                break;


            case "toggleSign":

                toggleSign();

                return;


            case "openParen":

                insertParenthesis("(");

                return;


            case "closeParen":

                insertParenthesis(")");

                return;


            default:

                return;
        }


        result =
            cleanNumber(result);


        state.current =
            result;

        state.previousAnswer =
            Number(result);

        state.expression =
            expression;

        state.firstOperand =
            null;

        state.operator =
            null;

        state.waitingForOperand =
            false;

        state.justCalculated =
            true;


        saveCalculation(
            expression,
            Number(result)
        );


        setStatus(
            "Scientific calculation"
        );

        updateDisplay();

    } catch (error) {

        showError(
            error.message
        );
    }
}


/* =========================================================
   FACTORIAL
========================================================= */

function factorial(number) {

    if (number === 0) {

        return 1;
    }

    let result = 1;

    for (
        let i = 1;
        i <= number;
        i++
    ) {

        result *= i;
    }

    return result;
}


/* =========================================================
   ANGLE CONVERSION
========================================================= */

function toRadians(value) {

    return value *
        Math.PI /
        180;
}


/* =========================================================
   PARENTHESES
========================================================= */

function insertParenthesis(
    parenthesis
) {

    if (
        parenthesis === "("
    ) {

        if (
            state.current !== "0" &&
            !state.justCalculated
        ) {

            state.expression +=
                `${state.current} × `;

        }


        state.expression += "(";

        state.current = "0";

        state.justCalculated = false;

    } else {

        state.expression +=
            `${state.current})`;

        state.current = "0";
    }


    updateDisplay();
}


/* =========================================================
   MEMORY
========================================================= */

function memoryClear() {

    state.memory = 0;

    saveMemory();

    setStatus(
        "Memory cleared"
    );

    updateDisplay();
}


function memoryRecall() {

    state.current =
        cleanNumber(
            state.memory
        );

    state.justCalculated =
        false;

    state.waitingForOperand =
        false;

    setStatus(
        "Memory recalled"
    );

    updateDisplay();
}


function memoryAdd() {

    const value =
        Number(state.current);


    if (
        !Number.isFinite(value)
    ) {
        return;
    }


    state.memory += value;

    state.memory =
        Number(
            cleanNumber(
                state.memory
            )
        );


    saveMemory();

    setStatus(
        "Added to memory"
    );

    updateDisplay();
}


function memorySubtract() {

    const value =
        Number(state.current);


    if (
        !Number.isFinite(value)
    ) {
        return;
    }


    state.memory -= value;

    state.memory =
        Number(
            cleanNumber(
                state.memory
            )
        );


    saveMemory();

    setStatus(
        "Subtracted from memory"
    );

    updateDisplay();
}


/* =========================================================
   MEMORY BUTTON HANDLER
========================================================= */

function handleMemoryAction(
    action
) {

    switch (action) {

        case "clear":

            memoryClear();

            break;


        case "recall":

            memoryRecall();

            break;


        case "add":

            memoryAdd();

            break;


        case "subtract":

            memorySubtract();

            break;
    }
}


/* =========================================================
   SAVE MEMORY
========================================================= */

function saveMemory() {

    localStorage.setItem(
        STORAGE.memory,
        String(state.memory)
    );
}


/* =========================================================
   LOAD MEMORY
========================================================= */

function loadMemory() {

    const saved =
        localStorage.getItem(
            STORAGE.memory
        );


    if (
        saved !== null &&
        Number.isFinite(
            Number(saved)
        )
    ) {

        state.memory =
            Number(saved);
    }
}


/* =========================================================
   HISTORY
========================================================= */

function saveCalculation(
    expression,
    result
) {

    state.history.unshift({

        expression:
            expression,

        result:
            result,

        time:
            new Date().toLocaleTimeString(
                [],
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            )
    });


    if (
        state.history.length > 50
    ) {

        state.history =
            state.history.slice(
                0,
                50
            );
    }


    localStorage.setItem(
        STORAGE.history,
        JSON.stringify(
            state.history
        )
    );


    renderHistory();
}


/* =========================================================
   LOAD HISTORY
========================================================= */

function loadHistory() {

    try {

        const saved =
            localStorage.getItem(
                STORAGE.history
            );


        if (saved) {

            const parsed =
                JSON.parse(saved);


            if (
                Array.isArray(parsed)
            ) {

                state.history =
                    parsed;
            }
        }

    } catch {

        state.history = [];
    }
}


/* =========================================================
   RENDER HISTORY
========================================================= */

function renderHistory() {

    historyList.innerHTML = "";


    if (
        state.history.length === 0
    ) {

        const empty =
            document.createElement(
                "div"
            );

        empty.className =
            "history-empty";

        empty.textContent =
            "No calculations yet.";

        historyList.appendChild(
            empty
        );

        return;
    }


    state.history.forEach(
        (item) => {

            const historyItem =
                document.createElement(
                    "div"
                );

            historyItem.className =
                "history-item";


            const expression =
                document.createElement(
                    "span"
                );

            expression.className =
                "history-expression";

            expression.textContent =
                item.expression;


            const result =
                document.createElement(
                    "span"
                );

            result.className =
                "history-result";

            result.textContent =
                `= ${formatNumber(
                    item.result
                )}`;


            const time =
                document.createElement(
                    "span"
                );

            time.className =
                "history-time";

            time.textContent =
                item.time || "";


            historyItem.appendChild(
                expression
            );

            historyItem.appendChild(
                result
            );

            historyItem.appendChild(
                time
            );


            historyItem.addEventListener(
                "click",
                () => {

                    state.current =
                        String(item.result);

                    state.previousAnswer =
                        Number(item.result);

                    state.expression =
                        item.expression;

                    state.firstOperand =
                        null;

                    state.operator =
                        null;

                    state.justCalculated =
                        true;

                    state.waitingForOperand =
                        false;


                    setStatus(
                        "Loaded from history"
                    );


                    updateDisplay();

                    closeHistoryPanel();
                }
            );


            historyList.appendChild(
                historyItem
            );
        }
    );
}


/* =========================================================
   CLEAR HISTORY
========================================================= */

function clearHistory() {

    state.history = [];

    localStorage.removeItem(
        STORAGE.history
    );

    renderHistory();

    showToast(
        "History cleared"
    );
}


/* =========================================================
   HISTORY PANEL
========================================================= */

function openHistoryPanel() {

    historyPanel.classList.add(
        "open"
    );

    historyPanel.setAttribute(
        "aria-hidden",
        "false"
    );


    renderHistory();
}


function closeHistoryPanel() {

    historyPanel.classList.remove(
        "open"
    );

    historyPanel.setAttribute(
        "aria-hidden",
        "true"
    );
}


/* =========================================================
   COPY RESULT
========================================================= */

async function copyCurrentResult() {

    if (
        state.current === "Error"
    ) {

        showToast(
            "Nothing to copy"
        );

        return;
    }


    try {

        await navigator.clipboard.writeText(
            state.current
        );


        showToast(
            "Result copied"
        );

    } catch {

        showToast(
            "Copy failed"
        );
    }
}


/* =========================================================
   TOAST
========================================================= */

let toastTimer;


function showToast(message) {

    toast.textContent =
        message;

    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            1800
        );
}


/* =========================================================
   THEME
========================================================= */

function toggleTheme() {

    document.body.classList.toggle(
        "dark"
    );


    const isDark =
        document.body.classList.contains(
            "dark"
        );


    themeButton.textContent =
        isDark ? "☾" : "☀";


    localStorage.setItem(
        STORAGE.theme,
        isDark ? "dark" : "light"
    );
}


/* =========================================================
   LOAD THEME
========================================================= */

function loadTheme() {

    const saved =
        localStorage.getItem(
            STORAGE.theme
        );


    if (
        saved === "dark"
    ) {

        document.body.classList.add(
            "dark"
        );

        themeButton.textContent =
            "☾";

    } else {

        themeButton.textContent =
            "☀";
    }
}


/* =========================================================
   SCIENTIFIC MODE
========================================================= */

function setScientificMode(
    enabled
) {

    state.scientificMode =
        enabled;


    if (enabled) {

        scientificPanel.classList.remove(
            "hidden"
        );

        scientificModeButton.classList.add(
            "active"
        );

        basicMode.classList.remove(
            "active"
        );

        setStatus(
            "Scientific mode"
        );

    } else {

        scientificPanel.classList.add(
            "hidden"
        );

        basicMode.classList.add(
            "active"
        );

        scientificModeButton.classList.remove(
            "active"
        );

        setStatus(
            "Basic mode"
        );
    }
}


/* =========================================================
   ANGLE MODE
========================================================= */

function toggleAngleMode() {

    state.angleMode =
        state.angleMode === "DEG"
            ? "RAD"
            : "DEG";


    localStorage.setItem(
        STORAGE.angle,
        state.angleMode
    );


    setStatus(
        `Angle mode: ${state.angleMode}`
    );
}


/* =========================================================
   LOAD ANGLE MODE
========================================================= */

function loadAngleMode() {

    const saved =
        localStorage.getItem(
            STORAGE.angle
        );


    if (
        saved === "RAD" ||
        saved === "DEG"
    ) {

        state.angleMode =
            saved;
    }
}


/* =========================================================
   IMPROVED ANGLE CONVERSION
========================================================= */

function convertAngle(
    value
) {

    if (
        state.angleMode === "RAD"
    ) {

        return value;
    }


    return value *
        Math.PI /
        180;
}


/* =========================================================
   KEYBOARD HANDLING
========================================================= */

function handleKeyboard(
    event
) {

    const key =
        event.key;


    /* Numbers */

    if (
        key >= "0" &&
        key <= "9"
    ) {

        event.preventDefault();

        inputNumber(key);

        return;
    }


    /* Decimal */

    if (
        key === "." ||
        key === ","
    ) {

        event.preventDefault();

        inputDecimal();

        return;
    }


    /* Operators */

    if (
        [
            "+",
            "-",
            "*",
            "/",
            "^"
        ].includes(key)
    ) {

        event.preventDefault();

        chooseOperator(key);

        return;
    }


    /* Equals */

    if (
        key === "Enter" ||
        key === "="
    ) {

        event.preventDefault();

        calculate();

        return;
    }


    /* Delete */

    if (
        key === "Backspace"
    ) {

        event.preventDefault();

        deleteLast();

        return;
    }


    /* Clear */

    if (
        key === "Escape"
    ) {

        event.preventDefault();

        resetCalculator();

        closeHistoryPanel();

        return;
    }


    /* Percentage */

    if (
        key === "%"
    ) {

        event.preventDefault();

        calculatePercentage();

        return;
    }


    /* Parentheses */

    if (
        key === "(" ||
        key === ")"
    ) {

        event.preventDefault();

        insertParenthesis(key);
    }
}


/* =========================================================
   BUTTON EVENTS
========================================================= */

function setupButtonEvents() {

    document
        .querySelectorAll(".calc-button")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const number =
                        button.dataset.number;

                    const operation =
                        button.dataset.operation;

                    const action =
                        button.dataset.action;


                    if (
                        number !== undefined
                    ) {

                        inputNumber(number);

                        return;
                    }


                    if (
                        operation !== undefined
                    ) {

                        chooseOperator(
                            operation
                        );

                        return;
                    }


                    switch (action) {

                        case "clear":

                            resetCalculator();

                            break;


                        case "delete":

                            deleteLast();

                            break;


                        case "percent":

                            calculatePercentage();

                            break;


                        case "decimal":

                            inputDecimal();

                            break;


                        case "equals":

                            calculate();

                            break;


                        case "toggle-sign":

                            toggleSign();

                            break;
                    }
                }
            );
        });
}


/* =========================================================
   SCIENTIFIC BUTTON EVENTS
========================================================= */

function setupScientificEvents() {

    document
        .querySelectorAll(
            ".scientific-button"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const functionName =
                        button.dataset.scientific;


                    scientificFunction(
                        functionName
                    );
                }
            );
        });
}


/* =========================================================
   MEMORY BUTTON EVENTS
========================================================= */

function setupMemoryEvents() {

    document
        .querySelectorAll(
            ".memory-button"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    handleMemoryAction(
                        button.dataset.memory
                    );
                }
            );
        });
}


/* =========================================================
   GENERAL EVENTS
========================================================= */

function setupGeneralEvents() {

    themeButton.addEventListener(
        "click",
        toggleTheme
    );


    historyButton.addEventListener(
        "click",
        openHistoryPanel
    );


    closeHistory.addEventListener(
        "click",
        closeHistoryPanel
    );


    copyResult.addEventListener(
        "click",
        copyCurrentResult
    );


    clearAllHistory.addEventListener(
        "click",
        clearHistory
    );


    basicMode.addEventListener(
        "click",
        () => {

            setScientificMode(false);
        }
    );


    scientificModeButton.addEventListener(
        "click",
        () => {

            setScientificMode(true);
        }
    );


    document.addEventListener(
        "keydown",
        handleKeyboard
    );
}


/* =========================================================
   HISTORY SWIPE
========================================================= */

function setupHistorySwipe() {

    let startX = 0;


    historyPanel.addEventListener(
        "touchstart",
        event => {

            startX =
                event.changedTouches[0].screenX;

        },
        {
            passive: true
        }
    );


    historyPanel.addEventListener(
        "touchend",
        event => {

            const endX =
                event.changedTouches[0].screenX;


            const distance =
                endX - startX;


            if (
                distance > 70
            ) {

                closeHistoryPanel();
            }

        },
        {
            passive: true
        }
    );
}


/* =========================================================
   OUTSIDE HISTORY CLICK
========================================================= */

document.addEventListener(
    "click",
    event => {

        if (
            !historyPanel.classList.contains(
                "open"
            )
        ) {
            return;
        }


        const clickedHistoryButton =
            historyButton.contains(
                event.target
            );


        const clickedPanel =
            historyPanel.contains(
                event.target
            );


        if (
            !clickedHistoryButton &&
            !clickedPanel
        ) {

            closeHistoryPanel();
        }
    }
);


/* =========================================================
   VISIBILITY CHANGE
========================================================= */

document.addEventListener(
    "visibilitychange",
    () => {

        if (
            document.visibilityState ===
            "visible"
        ) {

            updateDisplay();
        }
    }
);


/* =========================================================
   START APPLICATION
========================================================= */

setupButtonEvents();

setupScientificEvents();

setupMemoryEvents();

setupGeneralEvents();

setupHistorySwipe();

initializeCalculator();
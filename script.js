document.addEventListener('DOMContentLoaded', () => {
    const num1Input = document.getElementById('num1');
    const num2Input = document.getElementById('num2');
    const multiplicationResultSpan = document.getElementById('multiplication-result');
    const finalResultSpan = document.getElementById('final-result');
    const contraButton = document.getElementById('btn-contra');
    const favorButton = document.getElementById('btn-favor');
    const resetButton = document.getElementById('reset');

    let multiplicationResult = 0;

    // Función para calcular la multiplicación y actualizar la UI
    const calculate = () => {
        const num1 = parseFloat(num1Input.value) || 0;
        const num2 = parseFloat(num2Input.value) || 0;
        
        multiplicationResult = num1 * num2;
        
        // Muestra el resultado de la multiplicación
        multiplicationResultSpan.textContent = multiplicationResult.toFixed(2);
        
        // Al recalcular, el resultado final se resetea al de la multiplicación
        finalResultSpan.textContent = multiplicationResult.toFixed(2);
    };

    // Event listener para el botón "En Contra" (-70)
    contraButton.addEventListener('click', () => {
        const finalResult = 70 - multiplicationResult;
        finalResultSpan.textContent = finalResult.toFixed(2);
    });

    // Event listener para el botón "A Favor" (+70)
    favorButton.addEventListener('click', () => {
        const finalResult = multiplicationResult + 70;
        finalResultSpan.textContent = finalResult.toFixed(2);
    });

    // Event listener para reiniciar todo
    resetButton.addEventListener('click', () => {
        num1Input.value = '0';
        num2Input.value = '0';
        calculate(); // Recalcula para que todo vuelva a 0
    });

    // Calcula en tiempo real mientras se escribe en los inputs
    num1Input.addEventListener('input', calculate);
    num2Input.addEventListener('input', calculate);

    // Calcula al cargar la página por primera vez
    calculate();
});
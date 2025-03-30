// تابع اصلی برای مدیریت فرمول‌ها
document.addEventListener('DOMContentLoaded', function() {
    // پیدا کردن تمام المان‌هایی که دارای ویژگی formula هستند
    const formulaElements = document.querySelectorAll('[formula]');
    
    // برای هر المان، تابع محاسبه را اعمال می‌کنیم
    formulaElements.forEach(formulaElement => {
        const evaluator = formulaElement.getAttribute('evaluator');
        if (!evaluator) return; // اگر evaluator وجود نداشت، از این المان می‌گذریم
        
        // پیدا کردن تمام id های موجود در فرمول
        const idReferences = findIdReferences(evaluator);
        
        // اضافه کردن event listener برای هر ورودی که در فرمول استفاده شده
        idReferences.forEach(id => {
            const inputElement = document.getElementById(id);
            if (inputElement) {
                inputElement.addEventListener('input', () => {
                    calculateFormula(formulaElement, evaluator);
                });
            }
        });
        
        // محاسبه اولیه فرمول
        calculateFormula(formulaElement, evaluator);
    });
});

// تابع برای پیدا کردن id های استفاده شده در فرمول
function findIdReferences(formula) {
    // با استفاده از regex، تمام کلماتی که می‌توانند id باشند را پیدا می‌کنیم
    // به استثنای کلمات کلیدی جاوااسکریپت و توابع ریاضی
    const javascriptKeywords = ['Math', 'parseFloat', 'parseInt', 'Number', 'String', 'Boolean', 'Date', 'Array', 'Object', 'Function', 'RegExp', 'Error', 'Symbol', 'Promise', 'Proxy', 'Reflect', 'JSON', 'true', 'false', 'null', 'undefined', 'NaN', 'Infinity', 'this', 'arguments', 'super', 'console', 'window', 'document', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'default', 'break', 'continue', 'return', 'with', 'function', 'var', 'let', 'const', 'new', 'class', 'extends', 'get', 'set', 'static', 'yield', 'async', 'await', 'try', 'catch', 'finally', 'throw', 'typeof', 'instanceof', 'in', 'of', 'delete', 'void', 'debugger'];
    
    // الگوی regex برای پیدا کردن احتمالی id ها
    const idPattern = /[a-zA-Z_][a-zA-Z0-9_]*/g;
    
    // پیدا کردن همه تطابق‌ها
    const matches = formula.match(idPattern) || [];
    
    // حذف کلمات کلیدی و تکراری
    const uniqueIds = [...new Set(matches)].filter(word => !javascriptKeywords.includes(word));
    
    return uniqueIds;
}

// تابع برای محاسبه فرمول و نمایش نتیجه
function calculateFormula(formulaElement, evaluator) {
    try {
        // پیدا کردن مقادیر ورودی‌ها و ایجاد متغیرهای متناظر
        const idReferences = findIdReferences(evaluator);
        const context = {};
        
        // برای هر id، مقدار متناظر آن را از ورودی می‌خوانیم و در context ذخیره می‌کنیم
        idReferences.forEach(id => {
            const inputElement = document.getElementById(id);
            if (inputElement) {
                const value = inputElement.value;
                context[id] = value === '' ? '' : Number(value);
            } else {
                // اگر المان با این id پیدا نشد، آن را undefined می‌گذاریم
                context[id] = undefined;
            }
        });
        
        // ایجاد یک تابع با متغیرهای لازم و اجرای فرمول
        const args = idReferences;
        const values = args.map(arg => context[arg]);
        
        const funcBody = `
            try {
                return ${evaluator};
            } catch (error) {
                return "Invalid Formula";
            }
        `;
        
        const calculationFunction = new Function(...args, funcBody);
        let result = calculationFunction(...values);
        
        // بررسی نتیجه و نمایش آن
        if (result === '' || result === undefined || result === null || isNaN(result)) {
            formulaElement.value = '';
        } else if (typeof result === 'number') {
            // گرد کردن اعداد اعشاری به دو رقم بعد از اعشار
            formulaElement.value = Math.round(result * 100) / 100;
        } else {
            formulaElement.value = result;
        }
    } catch (error) {
        // در صورت بروز خطا، پیام Invalid Formula نمایش داده می‌شود
        formulaElement.value = 'Invalid Formula';
        console.error('Error calculating formula:', error);
    }
}

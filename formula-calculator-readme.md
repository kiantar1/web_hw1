# محاسبه‌گر فرمول

این پروژه یک محاسبه‌گر فرمول ساده است که به کاربران اجازه می‌دهد فرمول‌های مختلف را بر اساس مقادیر ورودی محاسبه کنند. این برنامه به صورت پویا فرمول‌ها را ارزیابی می‌کند و نتایج را بلافاصله نمایش می‌دهد.

## ویژگی‌ها

- محاسبه خودکار نتایج بر اساس فرمول‌های تعریف شده
- به‌روزرسانی آنی نتایج با تغییر مقادیر ورودی
- پشتیبانی از انواع فرمول‌های ریاضی و منطقی
- رابط کاربری ساده و کاربرپسند
- طراحی واکنش‌گرا با استفاده از Bootstrap

## نحوه کارکرد

### ساختار HTML

برنامه از یک ساختار HTML ساده استفاده می‌کند که شامل موارد زیر است:

1. فیلدهای ورودی برای دریافت مقادیر از کاربر
2. فیلدهای نتیجه برای نمایش نتیجه محاسبات
3. ویژگی `formula` در فیلدهای نتیجه که حاوی فرمول مورد نظر است

مثال:
```html
<input type="number" class="form-control" id="fee" placeholder="قیمت واحد">
<input type="number" class="form-control" id="count" placeholder="تعداد">
<input type="text" class="form-control result-field" readonly formula="count*fee-discount">
```

### روند اجرای کد

1. **بارگذاری صفحه**: زمانی که صفحه بارگذاری می‌شود، کد جاوااسکریپت اجرا می‌شود.
2. **یافتن المان‌های فرمول**: تمام المان‌هایی که ویژگی `formula` دارند شناسایی می‌شوند.
3. **شناسایی متغیرها**: برای هر فرمول، شناسه‌های (ID) فیلدهای ورودی مورد استفاده در فرمول شناسایی می‌شوند.
4. **افزودن رویدادها**: برای هر فیلد ورودی، رویداد `input` ثبت می‌شود تا با تغییر مقدار، فرمول مجدداً محاسبه شود.
5. **محاسبه فرمول**: فرمول با استفاده از مقادیر فعلی فیلدهای ورودی محاسبه و نتیجه نمایش داده می‌شود.

## توضیح جزئیات کد

### 1. راه‌اندازی اولیه

```javascript
document.addEventListener('DOMContentLoaded', function() {
    const formulaElements = document.querySelectorAll('[formula]');
    
    formulaElements.forEach(formulaElement => {
        const evaluator = formulaElement.getAttribute('formula');
        if (!evaluator) return;
        
        const idReferences = findIdReferences(evaluator);
        
        idReferences.forEach(id => {
            const inputElement = document.getElementById(id);
            if (inputElement) {
                inputElement.addEventListener('input', () => {
                    calculateFormula(formulaElement, evaluator);
                });
            }
        });
        
        calculateFormula(formulaElement, evaluator);
    });
});
```

این بخش:
- منتظر بارگذاری کامل DOM می‌ماند
- تمام المان‌های دارای ویژگی `formula` را پیدا می‌کند
- برای هر کدام، شناسه‌های مورد استفاده در فرمول را شناسایی می‌کند
- برای هر فیلد ورودی مرتبط، رویداد `input` را ثبت می‌کند
- محاسبه اولیه فرمول را انجام می‌دهد

### 2. یافتن شناسه‌های مورد استفاده در فرمول

```javascript
function findIdReferences(formula) {
    const javascriptKeywords = ['Math', 'parseFloat', ...];
    
    const idPattern = /[a-zA-Z_][a-zA-Z0-9_]*/g;
    
    const matches = formula.match(idPattern) || [];
    
    const uniqueIds = [...new Set(matches)].filter(word => !javascriptKeywords.includes(word));
    
    return uniqueIds;
}
```

این تابع:
- یک الگوی regex برای شناسایی شناسه‌های احتمالی در فرمول استفاده می‌کند
- کلمات کلیدی جاوااسکریپت را از نتایج حذف می‌کند
- شناسه‌های یکتا را برمی‌گرداند

### 3. محاسبه فرمول

```javascript
function calculateFormula(formulaElement, evaluator) {
    try {
        const idReferences = findIdReferences(evaluator);
        const context = {};
        
        idReferences.forEach(id => {
            const inputElement = document.getElementById(id);
            if (inputElement) {
                const value = inputElement.value;
                context[id] = value === '' ? '' : Number(value);
            } else {
                context[id] = undefined;
            }
        });
        
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
        
        if (result === '' || result === undefined || result === null || isNaN(result)) {
            formulaElement.value = '';
        } else if (typeof result === 'number') {
            formulaElement.value = Math.round(result * 100) / 100;
        } else {
            formulaElement.value = result;
        }
    } catch (error) {
        formulaElement.value = 'Invalid Formula';
        console.error('Error calculating formula:', error);
    }
}
```

این تابع:
- مقادیر فعلی تمام فیلدهای ورودی مرتبط را استخراج می‌کند
- یک تابع پویا با استفاده از `new Function()` ایجاد می‌کند که فرمول را ارزیابی می‌کند
- فرمول را با مقادیر فعلی اجرا می‌کند
- نتیجه را بررسی و در صورت لزوم گرد می‌کند
- نتیجه را در فیلد مربوطه نمایش می‌دهد
- در صورت بروز خطا، پیام خطای مناسب را نمایش می‌دهد

## مثال‌های کاربردی

در HTML سه مثال کاربردی ارائه شده است:

1. **محاسبه قیمت کل**: محاسبه قیمت نهایی با استفاده از قیمت واحد، تعداد و تخفیف
2. **محاسبه مساحت دایره**: محاسبه مساحت دایره با استفاده از شعاع
3. **محاسبه میانگین نمرات**: محاسبه میانگین چند نمره

## نکات مهم

- این برنامه از JavaScript برای ارزیابی پویای عبارات استفاده می‌کند
- عبارات‌ریاضی عادی و توابع `Math` جاوااسکریپت پشتیبانی می‌شوند
- نتایج عددی به دو رقم اعشار گرد می‌شوند
- مقادیر خالی به صورت مناسب مدیریت می‌شوند
- در صورت بروز خطا در فرمول، پیام "Invalid Formula" نمایش داده می‌شود

## نحوه استفاده

برای اضافه کردن یک محاسبه‌گر فرمول جدید به صفحه:

1. فیلدهای ورودی با شناسه‌های (ID) مشخص ایجاد کنید
2. یک فیلد نتیجه با ویژگی `formula` ایجاد کنید
3. فرمول مورد نظر را به عنوان مقدار ویژگی `formula` تعیین کنید

مثال:
```html
<input type="number" id="width">
<input type="number" id="height">
<input type="text" readonly formula="width * height">
```

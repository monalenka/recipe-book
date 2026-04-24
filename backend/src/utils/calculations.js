exports.calculateDishNutrition = (productsData) => {
    if (productsData === null || productsData === undefined) {
        throw new Error('productsData is required');
    }

    if (!Array.isArray(productsData)) {
        throw new Error('productsData must be an array');
    }

    if (productsData.length === 0) {
        return {
            totalCalories: 0,
            totalProteins: 0,
            totalFats: 0,
            totalCarbohydrates: 0,
            totalWeight: 0,
        };
    }

    let totalCalories = 0;
    let totalProteins = 0;
    let totalFats = 0;
    let totalCarbohydrates = 0;
    let totalWeight = 0;

    for (const item of productsData) {
        if (!item || typeof item !== 'object') {
            throw new Error('Each product item must be an object');
        }

        if (!Object.prototype.hasOwnProperty.call(item, 'quantity')) {
            throw new Error('Product item must have "quantity" field');
        }
        if (typeof item.quantity !== 'number' || isNaN(item.quantity)) {
            throw new Error('Product quantity must be a number');
        }
        if (item.quantity < 0) {
            throw new Error('Product quantity cannot be negative');
        }

        if (!item.product || typeof item.product !== 'object') {
            throw new Error('Product item must have "product" object');
        }

        const quantity = item.quantity;
        const factor = quantity / 100;

        totalCalories += (typeof item.product.calories === 'number' ? item.product.calories : 0) * factor;
        totalProteins += (typeof item.product.proteins === 'number' ? item.product.proteins : 0) * factor;
        totalFats += (typeof item.product.fats === 'number' ? item.product.fats : 0) * factor;
        totalCarbohydrates += (typeof item.product.carbohydrates === 'number' ? item.product.carbohydrates : 0) * factor;
        totalWeight += quantity;
    }

    return {
        totalCalories,
        totalProteins,
        totalFats,
        totalCarbohydrates,
        totalWeight,
    };
};

exports.checkDishFlagsAvailability = (products) => {
    if (!products || products.length === 0) {
        return { vegan: true, gluten_free: true, sugar_free: true };
    }

    const allVegan = products.every(p => p.flags && p.flags.includes('Веган'));
    const allGlutenFree = products.every(p => p.flags && p.flags.includes('Без глютена'));
    const allSugarFree = products.every(p => p.flags && p.flags.includes('Без сахара'));

    return {
        vegan: allVegan,
        gluten_free: allGlutenFree,
        sugar_free: allSugarFree,
    };
};

exports.processMacroInName = (name, selectedCategory) => {
    const macroMap = {
        '!десерт': 'Десерт',
        '!первое': 'Первое',
        '!второе': 'Второе',
        '!напиток': 'Напиток',
        '!салат': 'Салат',
        '!суп': 'Суп',
        '!перекус': 'Перекус',
    };

    let processedName = name;
    for (const macro of Object.keys(macroMap)) {
        const regex = new RegExp(macro, 'gi');
        processedName = processedName.replace(regex, '');
    }
    processedName = processedName.trim();

    let category = null;
    if (selectedCategory) {
        category = selectedCategory;
    } else {
        let bestIndex = Infinity;
        let bestMacro = null;
        const lowerName = name.toLowerCase();
        for (const macro of Object.keys(macroMap)) {
            const index = lowerName.indexOf(macro);
            if (index !== -1 && index < bestIndex) {
                bestIndex = index;
                bestMacro = macro;
            }
        }
        if (bestMacro) {
            category = macroMap[bestMacro];
        }
    }

    return { name: processedName, category };
};
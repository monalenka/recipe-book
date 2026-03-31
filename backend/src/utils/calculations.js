exports.calculateDishNutrition = (productsData) => {
    if (!productsData || productsData.length === 0) {
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
        const quantity = item.quantity || 0;
        const factor = quantity / 100;

        totalCalories += (item.product.calories || 0) * factor;
        totalProteins += (item.product.proteins || 0) * factor;
        totalFats += (item.product.fats || 0) * factor;
        totalCarbohydrates += (item.product.carbohydrates || 0) * factor;
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
    if (selectedCategory) {
        return { name, category: selectedCategory };
    }

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
    let detectedCategory = null;

    for (const [macro, category] of Object.entries(macroMap)) {
        const macroIndex = processedName.toLowerCase().indexOf(macro);
        if (macroIndex !== -1) {
            detectedCategory = category;
            processedName = processedName.replace(new RegExp(macro, 'i'), '').trim();
            break;
        }
    }

    return {
        name: processedName,
        category: detectedCategory,
    };
};
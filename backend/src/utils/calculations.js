exports.calculateDishNutrition = (productsData) => {
    if (!productsData || productsData.length === 0) {
        return { calories: 0, proteins: 0, fats: 0, carbohydrates: 0 };
    }

    const totals = productsData.reduce(
        (acc, item) => {
            const quantity = item.quantity || 0;
            const factor = quantity / 100;

            acc.calories += (item.product.calories || 0) * factor;
            acc.proteins += (item.product.proteins || 0) * factor;
            acc.fats += (item.product.fats || 0) * factor;
            acc.carbohydrates += (item.product.carbohydrates || 0) * factor;

            return acc;
        },
        { calories: 0, proteins: 0, fats: 0, carbohydrates: 0 }
    );

    return {
        calories: Math.round(totals.calories * 10) / 10,
        proteins: Math.round(totals.proteins * 10) / 10,
        fats: Math.round(totals.fats * 10) / 10,
        carbohydrates: Math.round(totals.carbohydrates * 10) / 10,
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
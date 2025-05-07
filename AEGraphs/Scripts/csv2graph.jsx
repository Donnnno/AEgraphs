(function() {
    // Vraag de gebruiker om de CSV-inhoud te plakken
    var csvContent = prompt("Plak hier de CSV-waarden (gescheiden door komma's en met nieuwe regels voor elke rij):", "");

    // Controleer of er iets is geplakt
    if (csvContent === null || csvContent.trim() === "") {
        alert("Geen waarden ingevoerd. Script wordt afgesloten.");
        return;
    }

    // Vervang alle puntkomma's door komma's om beide scheidingstekens te ondersteunen
    csvContent = csvContent.replace(/;/g, ",");


    // Vraag of de gebruiker de rijen in omgekeerde volgorde wil toepassen
    var reverseRows = confirm("Wil je de rijen omkeren? Klik op 'OK' voor Ja en 'Annuleren' voor Nee.");

    // Split de geplakte inhoud in rijen
    var rows = csvContent.trim().split("\n");
    
    // Keer de volgorde om indien de gebruiker hiervoor kiest
    if (reverseRows) {
        rows = rows.reverse();
    }

    // Debug: Toon het aantal gelezen rijen
    alert("Aantal rijen in CSV: " + rows.length);

    // Filter rijen die leeg zijn of niet met een numerieke waarde beginnen
    rows = rows.filter(function(row) {
        var trimmedRow = row.trim();
        var firstValue = trimmedRow.split(",")[0].trim();
        return trimmedRow !== "" && !isNaN(parseFloat(firstValue.replace(",", ".")));
    });

    var selectedLayers = app.project.activeItem.selectedLayers;

    if (selectedLayers.length === 0) {
        alert("No layers are selected. Please select the layers to apply the values.");
        return;
    }
    if (selectedLayers.length !== rows.length) {
        alert("Layer count and CSV row count mismatch. Selected layers: " + selectedLayers.length + ", CSV rows: " + rows.length);
        return;
    }

    app.beginUndoGroup("Apply CSV Row Values to Input Sliders");

    var errors = [];

    for (var i = 0; i < selectedLayers.length; i++) {
        var layer = selectedLayers[i];
        var values = rows[i].split(/\t|,/);
        
        // Vul ontbrekende kolommen aan met "0" totdat er precies 5 kolommen zijn
        while (values.length < 5) {
            values.push("0");
        }

        var effectsGroup = layer.property("Effects");
        var inputEffects = []; // Array voor alle "Input X" sliders in deze layer
        
        // Verzamel alle effecten die starten met "Input"
        for (var e = 1; e <= effectsGroup.numProperties; e++) {
            var effect = effectsGroup.property(e);
            if (effect.name.match(/^Input \d+$/) && effect.property("Slider")) {
                inputEffects.push(effect);
            }
        }
        
        // Gebruik nu inputEffects.length voor dynamisch aantal kolommen
        for (var j = 0; j < inputEffects.length; j++) {
            var value = values[j] ? values[j].trim() : "0";
            if (value === "") value = "0";
        
            var numericValue = parseFloat(value.replace(",", "."));
            if (!isNaN(numericValue)) {
                inputEffects[j].property("Slider").setValue(numericValue);
            } else {
                errors.push("Ongeldige waarde in CSV bij rij " + (i + 1) + ", kolom " + (j + 1) + ": " + value);
            }
        }
        
    }

    app.endUndoGroup();

    if (errors.length > 0) {
        alert("Problemen gevonden:\n" + errors.join("\n"));
    }
})();

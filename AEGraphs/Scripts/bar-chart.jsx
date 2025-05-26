// Helper function to convert hex color to RGB
function hexToRgb(hex) {
    // Remove the hash if it exists
    hex = hex.replace('#', '');
    
    // Parse the hex values
    var r = parseInt(hex.substring(0, 2), 16) / 255;
    var g = parseInt(hex.substring(2, 4), 16) / 255;
    var b = parseInt(hex.substring(4, 6), 16) / 255;
    
    return [r, g, b];
}

function createBarChart() {
    if (!app.project) {
        alert("No project open");
        return;
    }

    app.beginUndoGroup("New Graph");

    try {
        // Polyfill for String.trim() for older ExtendScript versions
        if (!String.prototype.trim) {
            String.prototype.trim = function () {
                return this.replace(/^\s+|\s+$/g, '');
            };
        }

        // Process CSV data
        var lines = csvData.split('\n');
        if (reverseData) {
            lines = lines.reverse();
        }
        
        // Remove empty lines and process data rows
        var dataRows = lines.filter(function(line) {
            return line.trim() !== '';
        });

        // Check for tab or comma delimiter
        var delimiter = dataRows[0].indexOf('\t') !== -1 ? '\t' : ',';
        
        var yAxisLabels = [];
        var barValues = [];
        
        // Process each row
        dataRows.forEach(function(row) {
            var parts = row.split(delimiter);
            if (parts.length >= 2) {
                yAxisLabels.push(parts[0].trim()); // First column for labels
                var value = parseFloat(parts[1]); // Second column for values
                if (!isNaN(value)) {
                    barValues.push(value);
                }
            }
        });

        var numBars = barValues.length;

        var compName = "Bar Chart";
        var width = aspectRatio.width;
        var height = aspectRatio.height;
        var duration = 60;
        var framerate = 25;

        var newComp = app.project.items.addComp(compName, width, height, 1, duration, framerate);
        if (!newComp) {
            throw new Error("Failed to create composition");
        }

        // Disable checkerboards
        app.activeViewer.views[0].options.checkerboards = false;


        // Create background layer
        var background = newComp.layers.addShape();
        background.name = "Achtergrond";
        background.label = 16;
        var contentsBackground = background.property("ADBE Root Vectors Group");
        var rectBackground = contentsBackground.addProperty("ADBE Vector Shape - Rect");
        rectBackground.property("Size").setValue([aspectRatio.width,aspectRatio.height]);        
        var fillBackground = background.property("Contents").addProperty("ADBE Vector Graphic - Fill");
        fillBackground.property("ADBE Vector Fill Color").setValue(hexToRgb(colorPalette.backgroundColor));
        background.locked = true;
        
        var shapeController = newComp.layers.addShape();
        shapeController.name = "Controller";
        shapeController.property("Transform").property("Position").setValue(aspectRatio.basePosition);
        shapeController.guideLayer = true;
        shapeController.label = 2;

        var contents = shapeController.property("ADBE Root Vectors Group");
        var rectGroup = contents.addProperty("ADBE Vector Group");
        rectGroup.name = "Null";

        var rect = rectGroup.property("Contents").addProperty("ADBE Vector Shape - Rect");
        rect.property("Size").setValue([100,100]);

        var strokeRect = rectGroup.property("Contents").addProperty("ADBE Vector Graphic - Stroke");
        strokeRect.property("ADBE Vector Stroke Color").setValue(hexToRgb(colorPalette.controllerColor));
        strokeRect.property("ADBE Vector Stroke Width").setValue(1);
        var strokeRectDash = strokeRect.property("ADBE Vector Stroke Dashes").addProperty("ADBE Vector Stroke Dash 1");
        strokeRectDash.setValue(5);
        
        // Controller controls 

        var sliderAmount = shapeController.property("ADBE Effect Parade").addProperty("ADBE Slider Control");
        sliderAmount.name = "Lijnen - Aantal";
        sliderAmount.property("ADBE Slider Control-0001").setValue(5);
    
        var sliderLenght = shapeController.property("ADBE Effect Parade").addProperty("ADBE Slider Control");
        sliderLenght.name = "Lijnen - Lengte";
        sliderLenght.property("ADBE Slider Control-0001").setValue(aspectRatio.graphLength);
    
        var sliderHeight = shapeController.property("ADBE Effect Parade").addProperty("ADBE Slider Control");
        sliderHeight.name = "Lijnen - Hoogte";
        sliderHeight.property("ADBE Slider Control-0001").setValue(aspectRatio.graphHeight);

        var sliderDistance = shapeController.property("ADBE Effect Parade").addProperty("ADBE Slider Control");
        sliderDistance.name = "Balk - Afstand";
        sliderDistance.property("ADBE Slider Control-0001").setValue(aspectRatio.barDistance);

        var sliderWidth = shapeController.property("ADBE Effect Parade").addProperty("ADBE Slider Control");
        sliderWidth.name = "Balk - Breedte";
        sliderWidth.property("ADBE Slider Control-0001").setValue(aspectRatio.barWidth);
    
        var dropdownYaxis = shapeController.property("ADBE Effect Parade").addProperty("ADBE Dropdown Control");
        var dropdownYaxisUpdate = dropdownYaxis.property(1).setPropertyParameters(["Waarde", "Woorden"]);
        // Check if first column contains any non-numeric values
        var hasWords = dataRows.some(function(row) {
            var firstCol = row.split(delimiter)[0].trim();
            return isNaN(parseFloat(firstCol));
        });
        dropdownYaxisUpdate.setValue(hasWords ? 2 : 1); // Set to "Woorden" (2) if words found, otherwise "Waarde" (1)
        dropdownYaxisUpdate.propertyGroup(1).name = "Y-As";

        var sliderMinVal = shapeController.property("ADBE Effect Parade").addProperty("ADBE Slider Control");
        sliderMinVal.name = "X-As - Min waarde";
        sliderMinVal.property("ADBE Slider Control-0001").setValue(minVal || 0);
    
        var sliderMaxVal = shapeController.property("ADBE Effect Parade").addProperty("ADBE Slider Control");
        sliderMaxVal.name = "X-As - Max waarde";
        sliderMaxVal.property("ADBE Slider Control-0001").setValue(maxVal || 1000);
    
        var sliderDecimalY = shapeController.property("ADBE Effect Parade").addProperty("ADBE Slider Control");
        sliderDecimalY.name = "X-As - Decimalen";
        sliderDecimalY.property("ADBE Slider Control-0001").setValue(0);
    
        var dropdownYaxisSign = shapeController.property("ADBE Effect Parade").addProperty("ADBE Dropdown Control");
        var dropdownYaxisSignUpdate = dropdownYaxisSign.property(1).setPropertyParameters(["Leeg", "Prefix", "Suffix"]);
        dropdownYaxisSignUpdate.propertyGroup(1).name = "X-As - Teken";

        var dropdownXaxis = shapeController.property("ADBE Effect Parade").addProperty("ADBE Dropdown Control");
        var dropdownXaxisUpdate = dropdownXaxis.property(1).setPropertyParameters(["Waarde", "Woorden"]);
        dropdownXaxisUpdate.propertyGroup(1).name = "X-As";
    
        var sliderStartNum = shapeController.property("ADBE Effect Parade").addProperty("ADBE Slider Control");
        sliderStartNum.name = "Y-As - Startgetal";
        sliderStartNum.property("ADBE Slider Control-0001").setValue(100);
    
        var sliderIncrement = shapeController.property("ADBE Effect Parade").addProperty("ADBE Slider Control");
        sliderIncrement.name = "Y-As - Toename";
        sliderIncrement.property("ADBE Slider Control-0001").setValue(1);
    
        var sliderStepSkip = shapeController.property("ADBE Effect Parade").addProperty("ADBE Slider Control");
        sliderStepSkip.name = "Y-As - Stap overslaan na";
        sliderStepSkip.property("ADBE Slider Control-0001").setValue(8);
    
        var sliderStep = shapeController.property("ADBE Effect Parade").addProperty("ADBE Slider Control");
        sliderStep.name = "Y-As - Stap";
        sliderStep.property("ADBE Slider Control-0001").setValue(5);

        // Create Lijnen
        var shapeLines = newComp.layers.addShape();
        shapeLines.name = "Lijnen"; 
        shapeLines.parent = shapeController;
        shapeLines.property("Transform").property("Position").setValue([0, 0]);

        var contentsLines = shapeLines.property("ADBE Root Vectors Group");

        // Horizontale lijnen en verticale lijnen zijn omgedraaid, namen in de code zijn volgens column-chart.jsx
        var groupHorLines = contentsLines.addProperty("ADBE Vector Group");
        groupHorLines.name = "Horizontale lijnen";
        var horLine = groupHorLines.property("Contents").addProperty("ADBE Vector Group");
        horLine.name = "lijn";
        
        var horLinePath = horLine.property("Contents").addProperty("ADBE Vector Shape - Group");
        horLinePath.property("ADBE Vector Shape").expression = "l = thisComp.layer(\"Controller\").effect(\"Lijnen - Hoogte\")(\"Slider\")*-1;createPath(points = [[0,l], [0,0]], inTangents = [], outTangents = [], is_closed = false)";
        
        var horLineStroke = horLine.property("Contents").addProperty("ADBE Vector Graphic - Stroke");
        horLineStroke.property("ADBE Vector Stroke Width").setValue(2);
        horLineStroke.property("ADBE Vector Stroke Color").setValue(hexToRgb(colorPalette.lineColor));
        
        var horRepeaters = groupHorLines.property("Contents").addProperty("ADBE Vector Filter - Repeater");
        horRepeaters.property("ADBE Vector Repeater Copies").expression = "thisComp.layer(\"Controller\").effect(\"Lijnen - Aantal\")(\"Slider\");";
        horRepeaters.property("ADBE Vector Repeater Transform").property("Position").expression = "c = content(\"Horizontale lijnen\").content(\"Repeater 1\").copies -1;calc = thisComp.layer(\"Controller\").effect(\"Lijnen - Lengte\")(\"Slider\")/c;[calc,0]";

        var groupVertLines = contentsLines.addProperty("ADBE Vector Group");
        groupVertLines.name = "Verticale lijnen";
        var vertLine = groupVertLines.property("Contents").addProperty("ADBE Vector Group");
        vertLine.name = "lijn";
        vertLine.property("Transform").property("Position").expression = "thisComp.layer(\"Balk 1\").transform.position";

        var vertLinePath = vertLine.property("Contents").addProperty("ADBE Vector Shape - Group");
        vertLinePath.property("Path").expression = "createPath(points = [[0,0],[-15,0]], inTangents = [], outTangents = [], is_closed = false)";

        var vertLineStroke = vertLine.property("Contents").addProperty("ADBE Vector Graphic - Stroke");
        vertLineStroke.property("ADBE Vector Stroke Width").setValue(2);
        vertLineStroke.property("ADBE Vector Stroke Color").setValue(hexToRgb(colorPalette.lineColor));
        
        var vertRepeaters = groupVertLines.property("Contents").addProperty("ADBE Vector Filter - Repeater");
        vertRepeaters.property("ADBE Vector Repeater Copies").expression = "var targetName = \"Balk\";var balkAantal = 0;\tfor (var i = 1; i <= thisComp.numLayers; i++) {\t\tif (thisComp.layer(i).name.indexOf(targetName) !== -1) {\t\t\tbalkAantal++;\t\t}\t}balkAantal;[balkAantal]";
        vertRepeaters.property("ADBE Vector Repeater Transform").property("Position").expression = "x = thisComp.layer(\"Controller\").effect(\"Balk - Afstand\")(\"Slider\");y = value[0];[y,x]";


        // X AXIS TEXT
        var xAxisText = newComp.layers.addText();
        xAxisText.name = "X-As";
        xAxisText.parent = shapeController;

        // Set up text properties
        var xAxisTextDocument = xAxisText.property("Source Text").value;
        xAxisTextDocument.resetCharStyle();
        xAxisTextDocument.fontSize = 40;
        xAxisTextDocument.leading = 0;
        xAxisTextDocument.applyFill = true;
        xAxisTextDocument.fillColor = hexToRgb(colorPalette.textColor);
        xAxisTextDocument.font = "Effra-Regular";
        if (xAxisTextDocument.font != "Effra-Regular") {
            xAxisTextDocument.font = "Effra Regular";
        }
        xAxisTextDocument.justification = ParagraphJustification.CENTER_JUSTIFY;
        xAxisTextDocument.text = "X-Axis";
        xAxisText.property("Source Text").setValue(xAxisTextDocument);

        // Set up position
        xAxisText.property("Transform").property("Position").dimensionsSeparated = true;
        xAxisText.property("Transform").property("X Position").expression = "thisComp.layer(\"Balk 1\").transform.position[0]";
        xAxisText.property("Transform").property("Y Position").setValue(55);

        // Set up text expression
        xAxisText.property("Source Text").expression = "const xAs = thisComp.layer(\"Controller\").effect(\"X-As\")(\"Menu\").value;\nconst maxVal = thisComp.layer(\"Controller\").effect(\"X-As - Max waarde\")(\"Slider\").value;\nconst minVal = thisComp.layer(\"Controller\").effect(\"X-As - Min waarde\")(\"Slider\").value;\nconst numLines = thisComp.layer(\"Controller\").effect(\"Lijnen - Aantal\")(\"Slider\") - 1;\nconst sum = (maxVal - minVal) / numLines;\nconst menu = thisComp.layer(\"Controller\").effect(\"X-As - Teken\")(\"Menu\").value;\nconst custom = thisLayer.name;\nconst decimalen = thisComp.layer(\"Controller\").effect(\"X-As - Decimalen\")(\"Slider\").value;\nlet num = \"\";\n\nif (xAs === 1) {\n    for (let i = 0; i <= numLines; i++) {\n        let value = minVal + sum * i;\n        let formatted = Number(value.toFixed(decimalen)).toLocaleString('nl-NL', { minimumFractionDigits: decimalen, maximumFractionDigits: decimalen });\n        \n        if (menu === 1) {\n            num += formatted + \"\\n\";\n        } else if (menu === 2) {\n            num += custom + formatted + \"\\n\";\n        } else {\n            num += formatted + custom + \"\\n\";\n        }\n    }\n    num.trim();\n} else {\n    var text = sourceText;\n}";

        // Text animator
        var textAnimator = xAxisText.property("ADBE Text Properties").property("ADBE Text Animators").addProperty("ADBE Text Animator");
        var textAnimatorProps = textAnimator.property("ADBE Text Animator Properties").addProperty("ADBE Text Line Spacing");
        textAnimatorProps.expression = "b = thisComp.layer(\"Controller\").effect(\"Lijnen - Lengte\")(\"Slider\")/(thisComp.layer(\"Controller\").effect(\"Lijnen - Aantal\")(\"Slider\")-1);y = value[1];var targetName = \"Balk\";var balkAantal = 0;\tfor (var i = 1; i <= thisComp.numLayers; i++) {\t\tif (thisComp.layer(i).name.indexOf(targetName) !== -1) {\t\t\tbalkAantal++;\t\t}\t}balkAantal;x = b;[x,y]";
        // Y AXIS TEXT
        var yAxisText = newComp.layers.addText();
        yAxisText.name = "Y-As";
        yAxisText.parent = shapeController;

        // Set up text properties
        var yAxisTextDocument = yAxisText.property("Source Text").value;
        yAxisTextDocument.resetCharStyle();
        yAxisTextDocument.fontSize = 40;
        yAxisTextDocument.leading = 0;
        yAxisTextDocument.applyFill = true;
        yAxisTextDocument.fillColor = hexToRgb(colorPalette.textColor);
        yAxisTextDocument.font = "Effra-Regular";
        if (yAxisTextDocument.font != "Effra-Regular") {
            yAxisTextDocument.font = "Effra Regular";
        }
        yAxisTextDocument.justification = ParagraphJustification.RIGHT_JUSTIFY;
        yAxisTextDocument.text = "Y-Axis";
        yAxisText.property("Source Text").setValue(yAxisTextDocument);
        yAxisText.property("Transform").property("Position").dimensionsSeparated = true;
        yAxisText.property("Transform").property("X Position").setValue(-46);
        yAxisText.property("Transform").property("Y Position").expression = "thisComp.layer(\"Balk 1\").transform.position[1]";
        yAxisText.property("Transform").property("Anchor Point").setValue([0, -11]);

        yAxisText.property("Source Text").setValue(yAxisLabels.join('\n'));
        yAxisText.property("Source Text").expression = "var yAs = thisComp.layer(\"Controller\").effect(\"Y-As\")(\"Menu\").value;\nvar base = thisComp.layer(\"Controller\").effect(\"Y-As - Startgetal\")(\"Slider\");\nvar increment = thisComp.layer(\"Controller\").effect(\"Y-As - Toename\")(\"Slider\");\nvar step1 = thisComp.layer(\"Controller\").effect(\"Y-As - Stap overslaan na\")(\"Slider\");\nvar step2 = thisComp.layer(\"Controller\").effect(\"Y-As - Stap\")(\"Slider\");\nvar targetName = \"Balk\";\nvar balkAantal = 0;\n\tfor (var i = 1; i <= thisComp.numLayers; i++) {\n\t\tif (thisComp.layer(i).name.indexOf(targetName) !== -1) {\n\t\t\tbalkAantal++;\n\t\t}\n\t}balkAantal;\nvar aantalLabels = Math.ceil(balkAantal / step2);\nif (yAs === 1) {\n\tvar text = \"\";\n\t\tif (balkAantal > step1) {\n\t\t\tfor (var j = 0; j < aantalLabels; j++){\n\t\t\t\ttext += (base + (increment * step2 * j)).toString() + \"\\n\";\n\t\t\t}\n\t\t} else {\n\t\t\tfor (var i = 0; i < balkAantal; i++) { \n\t\t\t\ttext += (base + (increment * i)).toString() + \"\\n\";\n\t\t\t}\n\t\t}\n\ttext.trim(); \n} else {\n\tvar text = sourceText;\n}";

        var yAxisTextAnimator = yAxisText.property("ADBE Text Properties").property("ADBE Text Animators").addProperty("ADBE Text Animator");
        var yAxisTextAnimatorProps = yAxisTextAnimator.property("ADBE Text Animator Properties").addProperty("ADBE Text Line Spacing");
        yAxisTextAnimatorProps.expression = "b = thisComp.layer(\"Controller\").effect(\"Balk - Afstand\")(\"Slider\");y = value[1];s = thisComp.layer(\"Controller\").effect(\"Y-As - Stap overslaan na\")(\"Slider\");s2 = thisComp.layer(\"Controller\").effect(\"Y-As - Stap\")(\"Slider\");var targetName = \"Balk\";var balkAantal = 0;\tfor (var i = 1; i <= thisComp.numLayers; i++) {\t\tif (thisComp.layer(i).name.indexOf(targetName) !== -1) {\t\t\tbalkAantal++;\t\t}\t}balkAantal;if (balkAantal > s) {\tx = b * s2;}else {\tx = b;}[y,x]";

        // Create Balk 1 separately
        var shapeBalk1 = newComp.layers.addShape();
        shapeBalk1.name = "Balk 1";
        shapeBalk1.parent = shapeController;
        shapeBalk1.label = 3;
        shapeBalk1.property("Transform").property("Position").setValue([0, 0]);
        shapeBalk1.property("Transform").property("Position").expression = "line = thisComp.layer(\"Controller\").effect(\"Lijnen - Hoogte\")(\"Slider\");\nafstand = thisComp.layer(\"Controller\").effect(\"Balk - Afstand\")(\"Slider\");\nbalkBreedte = thisComp.layer(\"Controller\").effect(\"Balk - Breedte\")(\"Slider\");\nvar targetName = \"Balk\";\nvar balkAantal = 0;\n\tfor (var i = 1; i <= thisComp.numLayers; i++) {\n\t\tif (thisComp.layer(i).name.indexOf(targetName) !== -1) {\n\t\t\tbalkAantal++;\n\t\t}\n\t}balkAantal;\nspacing = balkAantal - 1;\nx = thisComp.layer(\"Lijnen\").transform.position[0];\ny = (value[1]+(line / 2) - (afstand*spacing)/-2)*-1;\n[x,y]";
        shapeBalk1.property("Transform").property("Scale").expression = "w = effect(\"Calculation\")(\"Slider\");h = thisComp.layer(\"Controller\").effect(\"Balk - Breedte\")(\"Slider\");[w,h]";

        var contentsBalk1 = shapeBalk1.property("ADBE Root Vectors Group");
        var groepBalk1 = contentsBalk1.addProperty("ADBE Vector Group");
        groepBalk1.name = "Balk";
        
        var rectBalk1 = groepBalk1.property("Contents").addProperty("ADBE Vector Shape - Rect");
        rectBalk1.property("Size").expression = "x = thisComp.layer(\"Controller\").effect(\"Lijnen - Lengte\")(\"Slider\");\ny = thisComp.layer(\"Controller\").effect(\"Balk - Breedte\")(\"Slider\");\n[x,y]";
        rectBalk1.property("Position").expression = "x = content(\"Balk\").content(\"Rectangle Path 1\").size[0]/2;y = value[0];[x,y]";
        var balk1Fill = groepBalk1.property("Contents").addProperty("ADBE Vector Graphic - Fill");
        balk1Fill.property("ADBE Vector Fill Color").setValue(hexToRgb(colorPalette.barColor));

        var sliderBarInput1 = shapeBalk1.property("ADBE Effect Parade").addProperty("ADBE Slider Control");
        sliderBarInput1.name = "Input 1";
        sliderBarInput1.property("ADBE Slider Control-0001").setValue(barValues[0] || 500);
        sliderBarInput1.property("ADBE Slider Control-0001").setValueAtTime(20/newComp.frameRate, barValues[0] || 500); // plaatst een waarde op 20 frames, zonder data default 500
        var sliderBarCalc1 = shapeBalk1.property("ADBE Effect Parade").addProperty("ADBE Slider Control");
        sliderBarCalc1.name = "Calculation";
        sliderBarCalc1.property("ADBE Slider Control-0001").expression = "maxVal = thisComp.layer(\"Controller\").effect(\"X-As - Max waarde\")(\"Slider\");\nminVal = thisComp.layer(\"Controller\").effect(\"X-As - Min waarde\")(\"Slider\");\ninput = effect(\"Input 1\")(\"Slider\");\nrange = maxVal - minVal;\nnormInput = (input - minVal) / range;\ny = normInput * 100;\n[y]";
        
        // Add roughen edges effect for Stories style
        if (colorPalette.name === "Stories") {
            var roughenEdges = shapeBalk1.property("ADBE Effect Parade").addProperty("ADBE Roughen Edges");
            roughenEdges.property("ADBE Roughen Edges-0002").setValue(3.7);
            roughenEdges.property("ADBE Roughen Edges-0003").setValue(2);
            roughenEdges.property("ADBE Roughen Edges-0005").setValue(10);
        }


        // Create bars
        var barsToCreate = Math.max(2, numBars);

        for (var i = 1; i < barsToCreate; i++) {
            var shapeBar = newComp.layers.addShape();
            shapeBar.name = "Balk " + (i + 1);
            shapeBar.parent = shapeController;
            shapeBar.label = 3;
            shapeBar.property("Transform").property("Position").setValue([0, 0]);
            shapeBar.property("Transform").property("Position").expression = "const spacing = thisComp.layer(\"Controller\").effect(\"Balk - Afstand\")(\"Slider\");\nconst layerBelow = thisComp.layer(index + 1).transform.position.value[1];\nconst x = thisComp.layer(\"Balk 1\").transform.position[0];\nconst y = value[1] + layerBelow + spacing;\n[x, y]";
            shapeBar.property("Transform").property("Scale").expression = "w = effect(\"Calculation\")(\"Slider\");\nh = thisComp.layer(\"Controller\").effect(\"Balk - Breedte\")(\"Slider\");\n[w,h]";

            var contentsBar = shapeBar.property("ADBE Root Vectors Group");
            var groepBar = contentsBar.addProperty("ADBE Vector Group");
            groepBar.name = "Balk";
            
            var rectBar = groepBar.property("Contents").addProperty("ADBE Vector Shape - Rect");
            rectBar.property("Size").expression = "x = thisComp.layer(\"Controller\").effect(\"Lijnen - Lengte\")(\"Slider\");\ny = thisComp.layer(\"Controller\").effect(\"Balk - Breedte\")(\"Slider\");\n[x,y]";
            rectBar.property("Position").expression = "x = content(\"Balk\").content(\"Rectangle Path 1\").size[0]/2;y = value[0];[x,y]";

            var barFill = groepBar.property("Contents").addProperty("ADBE Vector Graphic - Fill");
            barFill.property("ADBE Vector Fill Color").setValue(hexToRgb(colorPalette.barColor));

            // Create sliders for this bar
            var sliderBarInput = shapeBar.property("ADBE Effect Parade").addProperty("ADBE Slider Control");
            sliderBarInput.name = "Input 1";
            sliderBarInput.property("ADBE Slider Control-0001").setValueAtTime(20/newComp.frameRate, barValues[i] || 500);
    
            var sliderBarCalc = shapeBar.property("ADBE Effect Parade").addProperty("ADBE Slider Control");
            sliderBarCalc.name = "Calculation";
            sliderBarCalc.property("ADBE Slider Control-0001").expression = "maxVal = thisComp.layer(\"Controller\").effect(\"X-As - Max waarde\")(\"Slider\");\nminVal = thisComp.layer(\"Controller\").effect(\"X-As - Min waarde\")(\"Slider\");\ninput = effect(\"Input 1\")(\"Slider\");\nrange = maxVal - minVal;\nnormInput = (input - minVal) / range;\ny = normInput * 100;\n[y]";

            // Add roughen edges effect for Stories style
            if (colorPalette.name === "Stories") {
                var roughenEdges2 = shapeBar.property("ADBE Effect Parade").addProperty("ADBE Roughen Edges");
                roughenEdges2.property("ADBE Roughen Edges-0002").setValue(3.7);
                roughenEdges2.property("ADBE Roughen Edges-0003").setValue(2);
                roughenEdges2.property("ADBE Roughen Edges-0005").setValue(10);
            }
        }

        // Create Lijn
        var shapeLine = newComp.layers.addShape();
        shapeLine.name = "Lijn"; 
        shapeLine.parent = shapeController;
        shapeLine.property("Transform").property("Position").setValue([0, 0]);
    
        var contentsLine = shapeLine.property("ADBE Root Vectors Group");
        var groupHorLine = contentsLine.addProperty("ADBE Vector Group");
        groupHorLine.name = "lijn";
        var horLine2 = groupHorLine.property("Contents").addProperty("ADBE Vector Group");
        horLine2.name = "lijn";
        
        var linePath = horLine2.property("Contents").addProperty("ADBE Vector Shape - Group");
        linePath.property("ADBE Vector Shape").expression = "l = thisComp.layer(\"Controller\").effect(\"Lijnen - Hoogte\")(\"Slider\")*-1;createPath(points = [[0,l], [0,0]], inTangents = [], outTangents = [], is_closed = false)";
        
        var lineStroke = horLine2.property("Contents").addProperty("ADBE Vector Graphic - Stroke");
        lineStroke.property("ADBE Vector Stroke Width").setValue(3);
        lineStroke.property("ADBE Vector Stroke Color").setValue(hexToRgb(colorPalette.lineColor));


        // Title Text
        var titleText = newComp.layers.addText();
        titleText.name = "Grafiektitel";
        titleText.parent = shapeController;

        var titleTextDocument = titleText.property("Source Text").value;
        titleTextDocument.resetCharStyle();
        titleTextDocument.fontSize = 60;
        titleTextDocument.leading = 65;
        titleTextDocument.ligature = true;
        titleTextDocument.applyFill = true;
        titleTextDocument.fillColor = hexToRgb(colorPalette.textColor);
        titleTextDocument.font = "Effra-Bold";
        if (titleTextDocument.font != "Effra-Bold") {
            titleTextDocument.font = "Effra Bold";
        }
        titleTextDocument.justification = ParagraphJustification.LEFT_JUSTIFY;
        titleTextDocument.text = graphTitle || "Grafiektitel";
        titleText.property("Source Text").setValue(titleTextDocument);

        titleText.property("Transform").property("Position").setValue([-41, -98]);
        titleText.property("Transform").property("Position").expression = "Yas = thisComp.layer(\"Y-As\").sourceRectAtTime().width\nx = value[0] - Yas;\ny = value[1];\nm = thisComp.layer(\"Controller\").effect(\"Lijnen - Hoogte\")(\"Slider\")*-1;\n[x,y+m]";


        // Subtitle Text
        var subtitleText = newComp.layers.addText();
        subtitleText.name = "Ondertitel";
        subtitleText.parent = shapeController;

        var subtitleTextDocument = subtitleText.property("Source Text").value;
        subtitleTextDocument.resetCharStyle();
        subtitleTextDocument.fontSize = 50;
        subtitleTextDocument.leading = 55;
        titleTextDocument.ligature = true;
        subtitleTextDocument.applyFill = true;
        subtitleTextDocument.fillColor = hexToRgb(colorPalette.textColor);
        subtitleTextDocument.font = "Effra-Regular";
        if (subtitleTextDocument.font != "Effra-Regular") {
            subtitleTextDocument.font = "Effra Regular";
        }
        subtitleTextDocument.justification = ParagraphJustification.LEFT_JUSTIFY;
        subtitleTextDocument.text = graphTitle || "Ondertitel";
        subtitleText.property("Source Text").setValue(subtitleTextDocument);
        subtitleText.property("Transform").property("Position").setValue([-41, 0]);
        subtitleText.property("Transform").property("Position").expression = "Yas = thisComp.layer(\"Y-As\").sourceRectAtTime().width\nt = thisComp.layer(\"Grafiektitel\").transform.position[1]+60;\nx = value[0] - Yas;\ny = value[1];\n[x,y+t]";


        // Source Text
        var sourceText = newComp.layers.addText();
        sourceText.name = "Bron";
        sourceText.parent = shapeController;

        var sourceTextDocument = sourceText.property("Source Text").value;
        sourceTextDocument.resetCharStyle();
        sourceTextDocument.fontSize = 40;
        sourceTextDocument.leading = 45;
        titleTextDocument.ligature = true;
        sourceTextDocument.applyFill = true;
        sourceTextDocument.fillColor = hexToRgb(colorPalette.textColor);
        sourceTextDocument.font = "Effra-Regular";
        if (sourceTextDocument.font != "Effra-Regular") {
            sourceTextDocument.font = "Effra Regular";
        }
        sourceTextDocument.justification = ParagraphJustification.RIGHT_JUSTIFY;
        sourceTextDocument.text = sourceTitle || "bron: NOS";
        sourceText.property("Source Text").setValue(sourceTextDocument);
        sourceText.property("Transform").property("Position").setValue([0, 0]);
        sourceText.property("Transform").property("Position").expression = "x = value[0] + thisComp.layer(\"Controller\").effect(\"Lijnen - Lengte\")(\"Slider\");\ny = value[1] + thisComp.layer(\"Grafiektitel\").transform.position[1];\n[x,y]";


        subtitleText.moveToBeginning();
        titleText.moveToBeginning();
        shapeController.moveToBeginning();

        app.endUndoGroup();
        newComp.openInViewer();
    } catch (e) {
        alert("Error creating column chart: " + e.message);
        app.endUndoGroup();
    }
}

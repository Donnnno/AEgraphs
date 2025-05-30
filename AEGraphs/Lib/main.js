var csInterface = new CSInterface();
console.log('Script loaded, waiting for DOMContentLoaded');

document.addEventListener('DOMContentLoaded', function () {
  var createButton = document.querySelector('#create');

  createButton.addEventListener('click', function () {
    createGraph();
  });

  // Get the main container
  var mainContainer = document.getElementById('mainContainer');

  // Add textarea for CSV data
  var textarea = document.createElement('textarea');
  textarea.id = 'csvData';
  textarea.style.width = '100%';
  textarea.style.height = '100px';
  textarea.style.marginTop = '10px';
  textarea.style.padding = '10px';
  textarea.style.backgroundColor = '#3d3d3d';
  textarea.style.color = '#fff';
  textarea.style.border = '1px solid #4d4d4d';
  textarea.style.borderRadius = '3px';
  textarea.style.boxSizing = 'border-box';
  textarea.placeholder = 'Paste your CSV data here...';
  mainContainer.appendChild(textarea);

  // Add checkbox container
  var checkboxContainer = document.getElementById('reverseCheckboxContainer');

  // Add checkbox
  var checkbox = document.getElementById('reverseCheckbox');
  checkbox.id = 'reverseData';
  
  // Store original data
  var originalData = '';

  // Add checkbox change handler
  checkbox.addEventListener('change', function() {
    if (textarea.value) {
      if (this.checked) {
        // Store original data if not already stored
        if (!originalData) {
          originalData = textarea.value;
        }
        // Reverse the data, filtering out empty lines
        var lines = originalData.split('\n').filter(line => line.trim() !== '');
        textarea.value = lines.reverse().join('\n');
      } else {
        // Restore original data
        textarea.value = originalData;
      }
    }
  });

  // Initialize the textarea
  mainContainer.appendChild(textarea);

  // Add elements to container
  mainContainer.appendChild(checkboxContainer);
});



function loadColorPalette(paletteName) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'config/color-palettes.json', true);
    xhr.onload = function() {
      if (xhr.status === 200) {
        const palettes = JSON.parse(xhr.responseText);
        const palette = palettes[paletteName];
        
        // Apply dark mode colors if enabled
        if (document.body.classList.contains('dark-mode')) {
          palette.backgroundColor = '#1e1e1e';
          palette.textColor = '#ffffff';
          palette.lineColor = '#ffffff';
        }
        
        resolve(palette);
      } else {
        reject(new Error('Failed to load color palette'));
      }
    };
    xhr.onerror = function() {
      reject(new Error('Failed to load color palette'));
    };
    xhr.send();
  });
}

function loadAspectRatio(aspectRatioName) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'config/aspect-ratios.json', true);
    xhr.onload = function() {
      if (xhr.status === 200) {
        const ratios = JSON.parse(xhr.responseText);
        resolve(ratios[aspectRatioName]);
      } else {
        reject(new Error('Failed to load aspect ratio'));
      }
    };
    xhr.onerror = function() {
      reject(new Error('Failed to load aspect ratio'));
    };
    xhr.send();
  });
}

async function createGraph() {
  const graphType = document.getElementById('graphDropdown').value;
  const csvData = document.getElementById('csvData').value;
  const reverseData = document.getElementById('reverseData').checked;
  const colorPalette = document.getElementById('colorPaletteDropdown').value;
  const aspectRatio = document.getElementById('aspectRatioDropdown').value;
  const graphTitle = document.getElementById('graphTitle').value;
  const subTitle = document.getElementById('subTitle').value;
  const sourceTitle = document.getElementById('sourceTitle').value;
  const minVal = document.getElementById('minVal').value;
  const maxVal = document.getElementById('maxVal').value;
  
  try {
    const paletteConfig = await loadColorPalette(colorPalette);
    const aspectRatioConfig = await loadAspectRatio(aspectRatio);
    
    let script = '';
    const escapedCsvData = csvData.replace(/"/g, '\\"').replace(/\n/g, '\\n');
    
    switch(graphType) {
      case 'columnChart':
        script = 'var scriptFile = new File("' + csInterface.getSystemPath(SystemPath.EXTENSION) + '/scripts/column-chart.jsx");\n' +
          'scriptFile.open("r");\n' +
          'var scriptContent = scriptFile.read();\n' +
          'scriptFile.close();\n' +
          'var csvData = "' + escapedCsvData + '";\n' +
          'var reverseData = ' + reverseData + ';\n' +
          'var colorPalette = ' + JSON.stringify(paletteConfig) + ';\n' +
          'var aspectRatio = ' + JSON.stringify(aspectRatioConfig) + ';\n' +
          'var graphTitle = "' + graphTitle.replace(/"/g, '\\"') + '";\n' +
          'var subTitle = "' + subTitle.replace(/"/g, '\\"') + '";\n' +
          'var sourceTitle = "' + sourceTitle.replace(/"/g, '\\"') + '";\n' +
          'var minVal = "' + minVal + '";\n' +
          'var maxVal = "' + maxVal + '";\n' +
          'eval(scriptContent);\n' +
          'createColumnChart();';
        break;
      case 'lineChart':
        script = 'var scriptFile = new File("' + csInterface.getSystemPath(SystemPath.EXTENSION) + '/scripts/line-chart.jsx");\n' +
          'scriptFile.open("r");\n' +
          'var scriptContent = scriptFile.read();\n' +
          'scriptFile.close();\n' +
          'var csvData = "' + escapedCsvData + '";\n' +
          'var reverseData = ' + reverseData + ';\n' +
          'var colorPalette = ' + JSON.stringify(paletteConfig) + ';\n' +
          'var aspectRatio = ' + JSON.stringify(aspectRatioConfig) + ';\n' +
          'var graphTitle = "' + graphTitle.replace(/"/g, '\\"') + '";\n' +
          'var subTitle = "' + subTitle.replace(/"/g, '\\"') + '";\n' +
          'var sourceTitle = "' + sourceTitle.replace(/"/g, '\\"') + '";\n' +
          'var minVal = "' + minVal + '";\n' +
          'var maxVal = "' + maxVal + '";\n' +
          'eval(scriptContent);\n' +
          'createLineChart();';
        break;
      case 'pieChart':
        script = 'var scriptFile = new File("' + csInterface.getSystemPath(SystemPath.EXTENSION) + '/scripts/pie-chart.jsx");\n' +
          'scriptFile.open("r");\n' +
          'var scriptContent = scriptFile.read();\n' +
          'scriptFile.close();\n' +
          'var csvData = "' + escapedCsvData + '";\n' +
          'var reverseData = ' + reverseData + ';\n' +
          'var colorPalette = ' + JSON.stringify(paletteConfig) + ';\n' +
          'var aspectRatio = ' + JSON.stringify(aspectRatioConfig) + ';\n' +
          'var graphTitle = "' + graphTitle.replace(/"/g, '\\"') + '";\n' +
          'var subTitle = "' + subTitle.replace(/"/g, '\\"') + '";\n' +
          'var sourceTitle = "' + sourceTitle.replace(/"/g, '\\"') + '";\n' +
          'var minVal = "' + minVal + '";\n' +
          'var maxVal = "' + maxVal + '";\n' +
          'eval(scriptContent);\n' +
          'createPieChart();';
        break;
      case 'barChart':
        script = 'var scriptFile = new File("' + csInterface.getSystemPath(SystemPath.EXTENSION) + '/scripts/bar-chart.jsx");\n' +
          'scriptFile.open("r");\n' +
          'var scriptContent = scriptFile.read();\n' +
          'scriptFile.close();\n' +
          'var csvData = "' + escapedCsvData + '";\n' +
          'var reverseData = ' + reverseData + ';\n' +
          'var colorPalette = ' + JSON.stringify(paletteConfig) + ';\n' +
          'var aspectRatio = ' + JSON.stringify(aspectRatioConfig) + ';\n' +
          'var graphTitle = "' + graphTitle.replace(/"/g, '\\"') + '";\n' +
          'var subTitle = "' + subTitle.replace(/"/g, '\\"') + '";\n' +
          'var sourceTitle = "' + sourceTitle.replace(/"/g, '\\"') + '";\n' +
          'var minVal = "' + minVal + '";\n' +
          'var maxVal = "' + maxVal + '";\n' +
          'eval(scriptContent);\n' +
          'createBarChart();';
        break;
      case 'barChartGroup':
        script = 'var scriptFile = new File("' + csInterface.getSystemPath(SystemPath.EXTENSION) + '/scripts/bar-chart-grouped.jsx");\n' +
          'scriptFile.open("r");\n' +
          'var scriptContent = scriptFile.read();\n' +
          'scriptFile.close();\n' +
          'var csvData = "' + escapedCsvData + '";\n' +
          'var reverseData = ' + reverseData + ';\n' +
          'var colorPalette = ' + JSON.stringify(paletteConfig) + ';\n' +
          'var aspectRatio = ' + JSON.stringify(aspectRatioConfig) + ';\n' +
          'var graphTitle = "' + graphTitle.replace(/"/g, '\\"') + '";\n' +
          'var subTitle = "' + subTitle.replace(/"/g, '\\"') + '";\n' +
          'var sourceTitle = "' + sourceTitle.replace(/"/g, '\\"') + '";\n' +
          'var minVal = "' + minVal + '";\n' +
          'var maxVal = "' + maxVal + '";\n' +
          'eval(scriptContent);\n' +
          'createBarChartGrouped();';
        break;
      case 'barChartStack':
        script = 'var scriptFile = new File("' + csInterface.getSystemPath(SystemPath.EXTENSION) + '/scripts/bar-chart-stacked.jsx");\n' +
          'scriptFile.open("r");\n' +
          'var scriptContent = scriptFile.read();\n' +
          'scriptFile.close();\n' +
          'var csvData = "' + escapedCsvData + '";\n' +
          'var reverseData = ' + reverseData + ';\n' +
          'var colorPalette = ' + JSON.stringify(paletteConfig) + ';\n' +
          'var aspectRatio = ' + JSON.stringify(aspectRatioConfig) + ';\n' +
          'var graphTitle = "' + graphTitle.replace(/"/g, '\\"') + '";\n' +
          'var subTitle = "' + subTitle.replace(/"/g, '\\"') + '";\n' +
          'var sourceTitle = "' + sourceTitle.replace(/"/g, '\\"') + '";\n' +
          'var minVal = "' + minVal + '";\n' +
          'var maxVal = "' + maxVal + '";\n' +
          'eval(scriptContent);\n' +
          'createBarChartStacked();';
        break;
      case 'ColumnChartGrouped':
        script = 'var scriptFile = new File("' + csInterface.getSystemPath(SystemPath.EXTENSION) + '/scripts/column-chart-grouped.jsx");\n' +
          'scriptFile.open("r");\n' +
          'var scriptContent = scriptFile.read();\n' +
          'scriptFile.close();\n' +
          'var csvData = "' + escapedCsvData + '";\n' +
          'var reverseData = ' + reverseData + ';\n' +
          'var colorPalette = ' + JSON.stringify(paletteConfig) + ';\n' +
          'var aspectRatio = ' + JSON.stringify(aspectRatioConfig) + ';\n' +
          'var graphTitle = "' + graphTitle.replace(/"/g, '\\"') + '";\n' +
          'var subTitle = "' + subTitle.replace(/"/g, '\\"') + '";\n' +
          'var sourceTitle = "' + sourceTitle.replace(/"/g, '\\"') + '";\n' +
          'var minVal = "' + minVal + '";\n' +
          'var maxVal = "' + maxVal + '";\n' +
          'eval(scriptContent);\n' +
          'createColumnChartGrouped();';
        break;
      case 'ColumnChartStacked':
        script = 'var scriptFile = new File("' + csInterface.getSystemPath(SystemPath.EXTENSION) + '/scripts/column-chart-stacked.jsx");\n' +
          'scriptFile.open("r");\n' +
          'var scriptContent = scriptFile.read();\n' +
          'scriptFile.close();\n' +
          'var csvData = "' + escapedCsvData + '";\n' +
          'var reverseData = ' + reverseData + ';\n' +
          'var colorPalette = ' + JSON.stringify(paletteConfig) + ';\n' +
          'var aspectRatio = ' + JSON.stringify(aspectRatioConfig) + ';\n' +
          'var graphTitle = "' + graphTitle.replace(/"/g, '\\"') + '";\n' +
          'var subTitle = "' + subTitle.replace(/"/g, '\\"') + '";\n' +
          'var sourceTitle = "' + sourceTitle.replace(/"/g, '\\"') + '";\n' +
          'var minVal = "' + minVal + '";\n' +
          'var maxVal = "' + maxVal + '";\n' +
          'eval(scriptContent);\n' +
          'createColumnChartStacked();';
        break;
    }
    
    csInterface.evalScript(script);
  } catch (error) {
    console.error('Error creating graph:', error);
  }
}

// Update checker
async function checkForUpdates() {
    try {
        // First get all releases to find the latest one including pre-releases
        const response = await fetch('https://api.github.com/repos/Donnnno/AEgraphs/releases', {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Authorization': `token ${config.githubToken}`
            }
        });
        const releases = await response.json();
        
        // Get the first release (most recent) from the array
        if (releases && releases.length > 0) {
            const latestRelease = releases[0];
            const latestVersion = latestRelease.tag_name.replace('v', '');
            const currentVersion = document.getElementById('versionLink').textContent.replace('v', '');
            
            // Convert versions to numbers for proper comparison
            const latestVersionNum = parseFloat(latestVersion);
            const currentVersionNum = parseFloat(currentVersion);
            
            if (latestVersionNum > currentVersionNum) {
                const versionDiv = document.getElementById('version');
                versionDiv.classList.add('update-available');
                const preReleaseText = latestRelease.prerelease ? ' (pre-release)' : '';
                const tooltip = document.getElementById('versionTooltip');
                tooltip.textContent = `New version available: v${latestVersion}${preReleaseText}`;
            }
        }
    } catch (error) {
        console.error('Failed to check for updates:', error);
    }
}

// Check for updates when the panel loads
document.addEventListener('DOMContentLoaded', checkForUpdates);

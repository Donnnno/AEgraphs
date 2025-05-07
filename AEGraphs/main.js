var csInterface = new CSInterface();

document.addEventListener('DOMContentLoaded', function () {
  var createButton = document.querySelector('#create');

  createButton.addEventListener('click', function () {
    createGraph();
  });

  // Add import button
  // var importButton = document.createElement('button');
  // importButton.id = 'importData';
  // importButton.textContent = 'Import Data';
  // importButton.style.marginTop = '10px';
  // document.body.appendChild(importButton);

  // Add checkbox container
  var checkboxContainer = document.createElement('div');
  checkboxContainer.style.marginTop = '10px';
  checkboxContainer.style.display = 'none';
  checkboxContainer.id = 'checkboxContainer';
  
  // Add checkbox
  var checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = 'reverseData';
  checkbox.style.marginRight = '8px';
  checkbox.style.cursor = 'pointer';
  
  // Add label
  var label = document.createElement('label');
  label.htmlFor = 'reverseData';
  label.textContent = 'Reverse Data';
  label.style.color = '#fff';
  label.style.cursor = 'pointer';
  
  // Add elements to container
  checkboxContainer.appendChild(checkbox);
  checkboxContainer.appendChild(label);
  document.body.appendChild(checkboxContainer);

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
  document.body.appendChild(textarea);

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
        // Reverse the data
        var lines = originalData.split('\n');
        textarea.value = lines.reverse().join('\n');
      } else {
        // Restore original data
        textarea.value = originalData;
      }
    }
  });

  // Add import functionality
  importButton.addEventListener('click', function() {
    if (checkboxContainer.style.display === 'none') {
      checkboxContainer.style.display = 'block';
      originalData = ''; // Reset original data
    } else {
      var csvData = textarea.value;
      var isReversed = checkbox.checked;
      
      console.log('CSV Data:', csvData);
      console.log('Reversed:', isReversed);
      // Here you can process the CSV data
      
      checkboxContainer.style.display = 'none';
      textarea.value = ''; // Clear the textarea
      checkbox.checked = false; // Reset checkbox
      originalData = ''; // Reset original data
    }
  });

  // Check for updates when the panel loads
  checkForUpdates();
  
  // Check for updates every 24 hours
  setInterval(checkForUpdates, 24 * 60 * 60 * 1000);
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
  
  try {
    const paletteConfig = await loadColorPalette(colorPalette);
    const aspectRatioConfig = await loadAspectRatio(aspectRatio);
    
    let script = '';
    switch(graphType) {
      case 'ColumnChart':
        const escapedCsvData = csvData.replace(/"/g, '\\"').replace(/\n/g, '\\n');
        script = 'var scriptFile = new File("' + csInterface.getSystemPath(SystemPath.EXTENSION) + '/scripts/column-chart.jsx");\n' +
          'scriptFile.open("r");\n' +
          'var scriptContent = scriptFile.read();\n' +
          'scriptFile.close();\n' +
          'var csvData = "' + escapedCsvData + '";\n' +
          'var reverseData = ' + reverseData + ';\n' +
          'var colorPalette = ' + JSON.stringify(paletteConfig) + ';\n' +
          'var aspectRatio = ' + JSON.stringify(aspectRatioConfig) + ';\n' +
          'eval(scriptContent);\n' +
          'createColumnChart();';
        break;
      case 'lineChart':
        script = 'var scriptFile = new File("' + csInterface.getSystemPath(SystemPath.EXTENSION) + '/scripts/line-chart.jsx");\n' +
          'scriptFile.open("r");\n' +
          'var scriptContent = scriptFile.read();\n' +
          'scriptFile.close();\n' +
          'eval(scriptContent);\n' +
          'createLineChart();';
        break;
      case 'pieChart':
        script = 'var scriptFile = new File("' + csInterface.getSystemPath(SystemPath.EXTENSION) + '/scripts/pie-chart.jsx");\n' +
          'scriptFile.open("r");\n' +
          'var scriptContent = scriptFile.read();\n' +
          'scriptFile.close();\n' +
          'eval(scriptContent);\n' +
          'createPieChart();';
        break;
      case 'barChart':
        script = 'var scriptFile = new File("' + csInterface.getSystemPath(SystemPath.EXTENSION) + '/scripts/bar-chart.jsx");\n' +
          'scriptFile.open("r");\n' +
          'var scriptContent = scriptFile.read();\n' +
          'scriptFile.close();\n' +
          'eval(scriptContent);\n' +
          'createBarChart();';
        break;
      case 'barChartGroup':
        script = 'var scriptFile = new File("' + csInterface.getSystemPath(SystemPath.EXTENSION) + '/scripts/bar-chart-grouped.jsx");\n' +
          'scriptFile.open("r");\n' +
          'var scriptContent = scriptFile.read();\n' +
          'scriptFile.close();\n' +
          'eval(scriptContent);\n' +
          'createBarChartGrouped();';
        break;
      case 'barChartStack':
        script = 'var scriptFile = new File("' + csInterface.getSystemPath(SystemPath.EXTENSION) + '/scripts/bar-chart-stacked.jsx");\n' +
          'scriptFile.open("r");\n' +
          'var scriptContent = scriptFile.read();\n' +
          'scriptFile.close();\n' +
          'eval(scriptContent);\n' +
          'createBarChartStacked();';
        break;
      case 'ColumnChartGrouped':
        script = 'var scriptFile = new File("' + csInterface.getSystemPath(SystemPath.EXTENSION) + '/scripts/column-chart-grouped.jsx");\n' +
          'scriptFile.open("r");\n' +
          'var scriptContent = scriptFile.read();\n' +
          'scriptFile.close();\n' +
          'eval(scriptContent);\n' +
          'createColumnChartGrouped();';
        break;
      case 'ColumnChartStacked':
        script = 'var scriptFile = new File("' + csInterface.getSystemPath(SystemPath.EXTENSION) + '/scripts/column-chart-stacked.jsx");\n' +
          'scriptFile.open("r");\n' +
          'var scriptContent = scriptFile.read();\n' +
          'scriptFile.close();\n' +
          'eval(scriptContent);\n' +
          'createColumnChartStacked();';
        break;
    }
    
    csInterface.evalScript(script);
  } catch (error) {
    console.error('Error creating graph:', error);
  }
}

// Add update check functionality
async function checkForUpdates() {
  try {
    const currentVersion = '0.1'; // This should match ExtensionBundleVersion in manifest.xml
    const response = await fetch('https://api.github.com/repos/Donnnno/AEgraphs/releases/latest');
    const data = await response.json();
    const latestVersion = data.tag_name.replace('v', ''); // Remove 'v' prefix if present
    
    if (compareVersions(latestVersion, currentVersion) > 0) {
      showUpdateNotification(latestVersion);
    }
  } catch (error) {
    console.error('Error checking for updates:', error);
  }
}

function compareVersions(v1, v2) {
  const v1Parts = v1.split('.').map(Number);
  const v2Parts = v2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
    const v1Part = v1Parts[i] || 0;
    const v2Part = v2Parts[i] || 0;
    
    if (v1Part > v2Part) return 1;
    if (v1Part < v2Part) return -1;
  }
  
  return 0;
}

function showUpdateNotification(latestVersion) {
  const notification = document.createElement('div');
  notification.style.position = 'fixed';
  notification.style.top = '10px';
  notification.style.right = '10px';
  notification.style.backgroundColor = '#4CAF50';
  notification.style.color = 'white';
  notification.style.padding = '10px';
  notification.style.borderRadius = '4px';
  notification.style.zIndex = '1000';
  notification.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
  
  const message = document.createElement('span');
  message.textContent = `Update available: v${latestVersion}`;
  
  const downloadLink = document.createElement('a');
  downloadLink.href = 'https://github.com/Donnnno/AEgraphs/releases/latest';
  downloadLink.textContent = 'Download';
  downloadLink.style.color = 'white';
  downloadLink.style.marginLeft = '10px';
  downloadLink.style.textDecoration = 'underline';
  downloadLink.target = '_blank';
  
  const closeButton = document.createElement('button');
  closeButton.textContent = '×';
  closeButton.style.float = 'right';
  closeButton.style.marginLeft = '10px';
  closeButton.style.background = 'none';
  closeButton.style.border = 'none';
  closeButton.style.color = 'white';
  closeButton.style.cursor = 'pointer';
  closeButton.style.fontSize = '16px';
  
  closeButton.addEventListener('click', () => {
    notification.remove();
  });
  
  notification.appendChild(message);
  notification.appendChild(downloadLink);
  notification.appendChild(closeButton);
  document.body.appendChild(notification);
}
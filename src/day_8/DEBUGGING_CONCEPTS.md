# 🎯 Day 8: Debugging & lil-gui Concepts Guide

## Table of Contents
1. [What is lil-gui?](#what-is-lil-gui)
2. [The Debug Object Pattern](#the-debug-object-pattern)
3. [Creating GUI Controls](#creating-gui-controls)
4. [Controller Types](#controller-types)
5. [Updating Scene Objects](#updating-scene-objects)
6. [Display-Only Information](#display-only-information)
7. [Organizing with Folders](#organizing-with-folders)
8. [Common Patterns](#common-patterns)
9. [Troubleshooting](#troubleshooting)

---

## What is lil-gui?

**lil-gui** is a lightweight JavaScript library that automatically creates UI controls (sliders, color pickers, buttons, checkboxes) based on JavaScript object properties.

### Key Benefits:
- ✅ Automatically generates controls based on property types
- ✅ Two-way binding: GUI ↔ Object properties
- ✅ Minimal code required
- ✅ Perfect for debugging and tweaking values in real-time

### Basic Setup:
```javascript
import GUI from 'lil-gui';

const gui = new GUI({
    title: 'Debug Panel',
    width: 350,
    close: true
});
```

---

## The Debug Object Pattern

### What is it?
A central object that stores ALL parameters you want to control through the GUI.

### Why use it?
1. **Single source of truth** - All debug values in one place
2. **Easy to save/load** - Can serialize the entire object
3. **Easy to reset** - Reset all values at once
4. **Separation of concerns** - GUI code separate from scene logic

### Example:
```javascript
const debugObject = {
    // Properties that will be controlled by GUI
    ballColor: '#ff3b6d',
    ballRoughness: 0.5,
    showHelpers: true,
    
    // Functions become buttons
    randomizeScene: function() {
        // Action code here
    }
};
```

---

## Creating GUI Controls

### Basic Syntax:
```javascript
gui.add(object, 'propertyName')
```

### With Options (for numbers):
```javascript
gui.add(object, 'propertyName', min, max, step)
```

### Chaining Methods:
```javascript
gui.add(object, 'property')
    .name('Custom Label')        // Change display name
    .onChange(value => {          // Callback when value changes
        // Update scene
    })
    .listen();                    // Auto-update display
```

---

## Controller Types

lil-gui automatically creates different controls based on property type:

### 1. Boolean → Checkbox
```javascript
debugObject.showGrid = true;
gui.add(debugObject, 'showGrid');  // Creates checkbox
```

### 2. Number → Slider
```javascript
debugObject.ballRoughness = 0.5;
gui.add(debugObject, 'ballRoughness', 0, 1, 0.01);  
// Creates slider: min=0, max=1, step=0.01
```

### 3. String → Text Input
```javascript
debugObject.name = 'My Object';
gui.add(debugObject, 'name');  // Creates text input
```

### 4. Color (Hex String) → Color Picker
```javascript
debugObject.ballColor = '#ff3b6d';
gui.addColor(debugObject, 'ballColor');  // Creates color picker
```

### 5. Function → Button
```javascript
debugObject.resetScene = function() {
    // Reset code
};
gui.add(debugObject, 'resetScene');  // Creates button
```

---

## Updating Scene Objects

There are **two main patterns** for connecting GUI controls to your scene:

### Pattern A: Through debugObject (with onChange)

**Flow:** `debugObject.value` → GUI → `onChange` → `sceneObject.property`

```javascript
// 1. Store value in debugObject
const debugObject = {
    ballColor: '#ff3b6d'
};

// 2. Create GUI control
gui.addColor(debugObject, 'ballColor')
    .onChange(color => {
        // 3. Update scene object when GUI changes
        golfBall.material.color.set(color);
    });
```

**When to use:**
- When you want to store values in debugObject
- When you need to do multiple operations on change
- When you want to save/load configurations

### Pattern B: Direct Binding (no onChange)

**Flow:** `sceneObject.property` → GUI (two-way binding)

```javascript
// Bind directly to Three.js object property
gui.add(golfBall.position, 'x', -5, 5, 0.1);
// No onChange needed! GUI directly modifies golfBall.position.x
```

**When to use:**
- Simple property updates
- When you don't need to store value in debugObject
- For transform properties (position, rotation, scale)

---

## Display-Only Information

Sometimes you want to **show** information but not let users edit it (like stats, counts, positions).

### The Pattern:

```javascript
// 1. Create object with display properties
const objectInfo = {
    totalObjects: '0',        // String, not number
    ballPosition: '0, 0, 0',  // String, not array!
    status: 'Ready'
};

// 2. Create controllers with .listen()
gui.add(objectInfo, 'totalObjects').listen();
gui.add(objectInfo, 'ballPosition').listen();

// 3. Update properties in your code
function updateObjectInfo() {
    objectInfo.totalObjects = scene.children.length.toString();
    const pos = golfBall.position;
    objectInfo.ballPosition = `${pos.x}, ${pos.y}, ${pos.z}`;
}

// 4. Call update function regularly (e.g., in animation loop)
function animate() {
    updateObjectInfo();  // GUI auto-updates via .listen()
    // ...
}
```

### Key Points:
- ✅ Use **strings** for display (not arrays!)
- ✅ Use **.listen()** to make GUI watch for changes
- ✅ Update properties in code, GUI reflects changes automatically
- ❌ **Arrays don't work!** Use strings: `'1, 2, 3'` not `[1, 2, 3]`

---

## Organizing with Folders

Folders help organize controls into logical groups.

### Creating Folders:
```javascript
const sceneFolder = gui.addFolder('Scene Settings');
const ballFolder = gui.addFolder('Golf Ball');
```

### Nested Folders:
```javascript
const ballFolder = gui.addFolder('Golf Ball');
const materialFolder = ballFolder.addFolder('Material');  // Nested!
const transformFolder = ballFolder.addFolder('Transform');  // Nested!
```

### Closing Folders:
```javascript
sceneFolder.close();  // Starts collapsed
```

---

## Common Patterns

### 1. Multiple Objects Update
```javascript
gui.add(debugObject, 'showHelpers')
    .onChange(value => {
        // Update multiple objects at once
        helper1.visible = value;
        helper2.visible = value;
        helper3.visible = value;
    });
```

### 2. Conditional Updates
```javascript
gui.addColor(debugObject, 'ghostColor')
    .onChange(color => {
        if (ghost) {  // Safety check
            ghost.material.color.set(color);
        }
    });
```

### 3. Multiple Operations on Change
```javascript
gui.add(debugObject, 'cameraFov', 30, 120, 1)
    .onChange(value => {
        camera.fov = value;
        camera.updateProjectionMatrix();  // Required after FOV change
    });
```

### 4. Action Buttons (Functions)
```javascript
const actions = {
    resetScene: function() {
        // Reset code
    },
    takeScreenshot: function() {
        // Screenshot code
    }
};

gui.add(actions, 'resetScene');
gui.add(actions, 'takeScreenshot');
```

### 5. Separate Action Objects
```javascript
// Keep actions separate from properties
const ghostActions = {
    summonGhost: function() { /* ... */ },
    banishGhost: function() { /* ... */ }
};

gui.add(ghostActions, 'summonGhost');
gui.add(ghostActions, 'banishGhost');
```

---

## Troubleshooting

### Problem: "gui.add failed" or "controller is undefined"

**Cause:** Trying to add an unsupported type (like arrays)

**Solution:** Convert to string
```javascript
// ❌ BAD - Arrays don't work
objectInfo.position = [1, 2, 3];
gui.add(objectInfo, 'position');  // FAILS!

// ✅ GOOD - Use strings
objectInfo.position = '1, 2, 3';
gui.add(objectInfo, 'position');  // Works!
```

### Problem: GUI doesn't update when values change in code

**Solution:** Use `.listen()`
```javascript
// Without .listen() - only shows initial value
gui.add(objectInfo, 'count');

// With .listen() - updates automatically
gui.add(objectInfo, 'count').listen();
```

### Problem: onChange not being called

**Check:**
1. Is the property actually changing? (check with console.log)
2. Are you modifying the property directly? (GUI only triggers onChange for GUI interactions)
3. For direct binding, onChange isn't needed - the property updates directly

### Problem: Color picker not working

**Check:**
1. Is the value a hex string? (`'#ff0000'` not `0xff0000` or `[255, 0, 0]`)
2. Are you using `addColor()` not `add()`?

---

## Quick Reference

| What You Want | Code |
|--------------|------|
| Checkbox | `gui.add(obj, 'booleanProp')` |
| Slider | `gui.add(obj, 'numberProp', min, max, step)` |
| Text Input | `gui.add(obj, 'stringProp')` |
| Color Picker | `gui.addColor(obj, 'colorProp')` |
| Button | `gui.add(obj, 'functionProp')` |
| Custom Label | `.name('Label')` |
| On Change | `.onChange(value => { ... })` |
| Auto Update | `.listen()` |
| Folder | `gui.addFolder('Name')` |
| Close Folder | `folder.close()` |

---

## Summary

1. **Create debugObject** - Store all tweakable values
2. **Create GUI** - `new GUI({ ... })`
3. **Add controls** - `gui.add(object, 'property')`
4. **Connect to scene** - Use `onChange` or direct binding
5. **Display info** - Use `.listen()` for read-only values
6. **Organize** - Use folders for better structure

Happy debugging! 🎯


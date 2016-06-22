# FeatureMatrix

## This is a work in progress!
The repo and documentation are still a work in progress and aren't at version 1 yet. We'll improve this over time.

## What is FeatureMatrix?
FeatureMatrix is a JavaScript library for rendering feature support matrices that look like this:

(TODO: put a screenshot here)

Rather than having to explicitly define the browsers that are supported by particular features, FeatureMatrix dynamically queries the [caniuse dataset](https://github.com/Fyrd/caniuse) to determine what browsers are supported. Features can:

 - Require support for web standards
 - Require the prescence of the Flash Player
 - Blacklist browsers
 - Whitelist browsers

Blacklisting/whitelisting is provided as a fallback for cases where there's no alternative (for example, if a browser is marked as supporting the web standards you require but there's a bug that's breaking things).

## Getting FeatureMatrix
FeatureMatrix is available on npm as [feature-matrix](https://www.npmjs.com/package/feature-matrix).


## Usage

In your requirements file:
```json
{
    "features": {
        "a-feature": {
            "humanReadableName": "An Amazing Feature",
            "requiredBrowserFeatures": [
                "caniuse:svg",
                "caniuse:webgl"
            ]
        },
        "another-feature": {
            "humanReadableName": "A Legacy Feature",
            "requiredBrowserPlugins": [
                "Flash 9+"
            ],
            "blacklist": [
                "IE 6-7"
            ]
        }
    }
}
```

In your JS:
```javascript
// 'path/to/requirements.json' could also be an Object containing the requirements
FeatureMatrix.loadRequirements('path/to/requirements.json', function (err, reqs) {
    if (err) {
        handleError(err);
    } else {
        var fm = new FeatureMatrix('#mountpoint', reqs);
    }
});
```

### Customising strings

All strings (including those used to indicate success/failure) can be changed using an options argument to the `FeatureMatrix` constructor. The plugin requirement text is configured using a function that returns the requirement string for that plugin to provide maximum flexibility.

```javascript
FeatureMatrix.loadRequirements('path/to/requirements.json', function (err, reqs) {
    // TODO: you should add error checking here
    var fm = new FeatureMatrix('#mountpoint', reqs, {
        supportedText: 'yes',
        unsupportedText: 'no',
        unknownText: '???',
        featureColumnLabel: 'Capability',

        // this is a lot nicer if you have ES6 arrow functions and template strings
        pluginRequirementGenerator: function (plugin, version) {
            return 'Requires the installation of ' + plugin + ' ' + version;
        }
    });
});
```

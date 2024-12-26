# Statistical Packages that work with `DataFrame`

## ANCOVA Analysis Module

A JavaScript implementation of Analysis of Covariance (ANCOVA) that works with the DataFrame library. This module provides robust statistical analysis capabilities for comparing groups while controlling for covariates.

### Features

- 🔍 Full ANCOVA implementation with partial F-tests
- 📊 Works seamlessly with DataFrame objects
- 📈 Automatic dummy variable encoding
- 🧮 Comprehensive model statistics
- ⚡ Efficient matrix operations
- 🔬 Detailed statistical output

### Installation

The ANCOVA module is part of the DataFrame package. Install it along with its dependencies:

```bash
npm install @eli-s-goldberg/dataframe
```

### Usage

#### Basic Example

```javascript
import { DataFrame } from "@eli-s-goldberg/dataframe"
import { AncovaAnalysis } from "@eli-s-goldberg/dataframe/ancova"

// Create your DataFrame
const data = new DataFrame([
  { group: "A", score: 85, age: 25 },
  { group: "B", score: 90, age: 28 },
  // ... more data
])

// Initialize ANCOVA
const ancova = new AncovaAnalysis({
  data: data,
  options: {
    dependentVar: "score",
    covariates: "age",
    groupVar: "group",
  },
})

// Run analysis
const results = await ancova.analyze()
```

#### Detailed Example

```javascript
// Create DataFrame with multiple covariates
const df = new DataFrame([
  { group: "Control", outcome: 75, covar1: 30, covar2: 45 },
  { group: "Treatment1", outcome: 82, covar1: 28, covar2: 50 },
  { group: "Treatment2", outcome: 85, covar1: 35, covar2: 42 },
  // ... more data
])

// Initialize ANCOVA with multiple covariates
const analysis = new AncovaAnalysis({
  data: df,
  options: {
    dependentVar: "outcome",
    covariates: ["covar1", "covar2"],
    groupVar: "group",
  },
})

// Perform analysis
const results = await analysis.analyze()

// Access results
console.log("Reduced Model:", results.reducedModel)
console.log("Full Model:", results.fullModel)
console.log("Partial F-test:", results.partialF)
console.log("Group Levels:", results.levels)
```

### API Reference

#### Constructor Options

```javascript
const ancova = new AncovaAnalysis({
  data: DataFrame,      // Required: DataFrame instance
  options: {
    dependentVar: string,           // Required: Name of dependent variable
    covariates: string | string[],  // Required: Covariate(s) to control for
    groupVar: string               // Required: Grouping variable
  }
});
```

#### Methods

##### analyze()

Performs the ANCOVA analysis and returns detailed results.

Returns:

```javascript
{
  reducedModel: {
    beta: number[],      // Coefficient estimates
    se: number[],        // Standard errors
    tStats: number[],    // t-statistics
    pValues: number[],   // p-values for coefficients
    yhat: number[],      // Fitted values
    residuals: number[], // Model residuals
    rss: number,         // Residual sum of squares
    df: number,          // Degrees of freedom
    s2: number,          // Error variance estimate
    XtX_inv: number[][] // Inverse of X'X matrix
  },
  fullModel: {
    // Same structure as reducedModel
  },
  partialF: {
    fStatistic: number, // F-statistic for group effect
    pValue: number     // p-value for group effect
  },
  levels: string[]     // Levels of the grouping variable
}
```

### Technical Details

#### Implementation Notes

- Uses dummy variable encoding for categorical variables
- Implements efficient matrix operations
- Performs automatic validation of input data
- Handles singular and near-singular matrices
- Calculates comprehensive model statistics

#### Statistical Methods

The implementation follows standard ANCOVA methodology:

1. Creates dummy variables for the grouping variable
2. Fits two models:
   - Reduced model: Only covariates
   - Full model: Covariates + group effects
3. Performs partial F-test to assess group effects
4. Calculates comprehensive model statistics

### Requirements

- DataFrame library
- jStat (automatically loaded via d3-require)

### Error Handling

The module includes comprehensive error checking:

- Validates input DataFrame
- Checks for missing variables
- Verifies numeric data types
- Handles singular matrices
- Validates model assumptions

### Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### License

MIT

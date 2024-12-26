# DataFrame

A high-performance DataFrame implementation for JavaScript with support for concurrent operations and typed arrays. 

Further, I'm developing some statistical packages (that are *cough* clones of my favorite package's functionality in python/R.)

## Example

If you want an example, check out my little primer: [as-close-to-python-as-possible](https://eli-s-goldberg.github.io/experimental-design/as-close-to-python-as-possible).


## DataFrame Features

- 🚀 High-performance data manipulation using TypedArrays
- ⚡ Concurrent processing for large datasets using Web Workers
- 📊 Pandas-like API for familiar data operations
- 📈 Built-in visualization capabilities using Observable Plot
- 🔢 Strong support for numerical computations
- 🧮 Statistical operations including correlation and aggregations
- 🔄 Chainable operations for elegant data transformations


### Statistical Tooling that works with `DataFrame`
####  `ancova.js`: 
This package implements an Analysis of Covariance (ANCOVA) regression that combines aspects of ANOVA and regression analysis. It allows for testing group differences while controlling for continuous covariates, using dummy variable encoding and partial F-tests to assess the significance of group effects.
Key components:

Performs dummy variable encoding for categorical groups, enabling the inclusion of non-numeric variables in the regression analysis
Constructs and compares two models: a reduced model with only covariates and a full model that includes both covariates and group effects
Uses partial F-tests to evaluate whether group differences are statistically significant after accounting for the covariates' effects

The implementation uses matrix operations for model fitting and includes robust error handling for data validation, matrix singularity checks, and calculation of standard statistical measures (t-stats, p-values, residuals).


## Installation

```bash
npm install @eli-s-goldberg/DataFrame
```

Or install directly from GitHub:

```bash
npm install github:eli-s-goldberg/DataFrame
```

## Quick Start

```javascript
import { DataFrame } from '@eli-s-goldberg/dataframe';

// Create a DataFrame from an array of objects
const data = [
  { name: 'John', age: 30, city: 'New York' },
  { name: 'Jane', age: 25, city: 'Boston' },
  { name: 'Bob', age: 35, city: 'Chicago' }
];

const df = new DataFrame(data);

// Basic operations
console.log(df.head());  // View first few rows
console.log(df.describe());  // Get statistical summary

// Filter data
const filtered = df.query('age > 25');

// Group and aggregate
const grouped = df.groupby('city').agg({
  age: ['mean', 'min', 'max']
});
```

## Key Operations

### Data Creation and Import

```javascript
// From array of objects
const df1 = new DataFrame([
  { a: 1, b: 'x' },
  { a: 2, b: 'y' }
]);

// From column-based object
const df2 = new DataFrame({
  a: [1, 2, 3],
  b: ['x', 'y', 'z']
});
```

### Data Selection

```javascript
// Select specific columns
const subset = df.select(['name', 'age']);

// Filter rows
const filtered = df.loc(row => row.age > 30);
const queryFiltered = df.query('age > 30');
```

### Aggregation and Grouping

```javascript
// Regular groupby
const grouped = df.groupby('category').agg({
  value: ['mean', 'sum', 'min', 'max']
});

// Concurrent groupby for large datasets
const largeGrouped = await df.concurrentGroupBy('category', {
  value: ['mean', 'sum', 'min', 'max']
});
```

### Statistical Operations

```javascript
// Correlation between columns
const correlation = df.corr('column1', 'column2');

// Full correlation matrix
const corrMatrix = df.corrMatrix();

// Statistical summary
const stats = df.describe();
```

### Data Manipulation

```javascript
// Fill missing values
const filled = df.fillna(0);

// Apply function to column
const transformed = df.apply('age', x => x * 2);

// Add new column
const withBMI = df.assign('bmi', row => row.weight / (row.height ** 2));
```

### Visualization

```javascript
// Create correlation plot
df.corrPlot({
  width: 600,
  height: 400,
  scheme: 'blues'
});
```

## Advanced Usage

### Concurrent Processing

For large datasets, use concurrent processing to leverage multiple CPU cores:

```javascript
const df = new DataFrame(largeDataset);

// Concurrent groupby operation
const result = await df.concurrentGroupBy(['region', 'category'], {
  sales: ['sum', 'mean'],
  profit: ['min', 'max', 'mean']
});
```

### Type Management

```javascript
// Set column types
df.setType('date_column', 'date');
df.setType('numeric_column', 'number');

// Set multiple types at once
df.setTypes({
  date_column: 'date',
  numeric_column: 'number',
  text_column: 'string'
});
```

## Repository Structure

```
DataFrame/
├── src/
│   ├── index.js
│   ├── dataframe.js
│   ├── utils/
│   │   ├── type-utils.js
│   │   └── math-utils.js
│   └── workers/
│       └── groupby-worker.js
├── test/
│   └── dataframe.test.js
├── examples/
│   ├── basic-usage.js
│   └── advanced-usage.js
├── package.json
└── README.md
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Credits

Built with ❤️ by [Eli Goldberg](https://github.com/eli-s-goldberg)
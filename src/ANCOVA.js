import { DataFrame } from "./DataFrame.js"
import { require } from "d3-require"

export class AncovaAnalysis {
  constructor({ data, options }) {
    // Check if data is an instance of the imported DataFrame class
    console.log("Data type:", Object.prototype.toString.call(data))
    console.log("Is DataFrame:", data instanceof DataFrame)
    console.log("Data properties:", Object.keys(data))

    if (!(data instanceof DataFrame)) {
      throw new Error("data must be a DataFrame instance")
    }

    const { dependentVar, covariates, groupVar } = options
    this.df = data
    this.dependentVar = dependentVar
    this.covariates = Array.isArray(covariates) ? covariates : [covariates]
    this.groupVar = groupVar

    // Validate inputs
    this._validateInputs()
  }
  async analyze() {
    // Load jStat asynchronously
    const jStat = await require("jstat@1.9.4")

    // Create dummy variables for the group variable
    const { encodedData, levels } = this._encodeDummies()

    // Prepare design matrices
    const dummyCols = levels.slice(1).map((lvl) => `${this.groupVar}_${lvl}`)

    // Fit reduced model (only covariates)
    const reducedDesign = this._buildDesignMatrix(encodedData, this.covariates)
    const reducedModel = this._fitModel(reducedDesign.X, reducedDesign.y, jStat)

    // Fit full model (covariates + group dummies)
    const fullDesign = this._buildDesignMatrix(encodedData, [
      ...this.covariates,
      ...dummyCols,
    ])
    const fullModel = this._fitModel(fullDesign.X, fullDesign.y, jStat)

    // Perform partial F-test
    const partialF = this._partialFTest(
      reducedModel.rss,
      fullModel.rss,
      reducedModel.df,
      fullModel.df,
      dummyCols.length,
      jStat
    )

    return {
      reducedModel,
      fullModel,
      partialF,
      levels,
    }
  }

  _validateInputs() {
    // Check dependent variable
    if (!this.df._data[this.dependentVar]) {
      throw new Error(
        `Dependent variable '${this.dependentVar}' not found in DataFrame`
      )
    }
    if (this.df._types[this.dependentVar] !== "number") {
      throw new Error(
        `Dependent variable '${this.dependentVar}' must be numeric`
      )
    }

    // Check covariates
    this.covariates.forEach((covar) => {
      if (!this.df._data[covar]) {
        throw new Error(`Covariate '${covar}' not found in DataFrame`)
      }
      if (this.df._types[covar] !== "number") {
        throw new Error(`Covariate '${covar}' must be numeric`)
      }
    })

    // Check group variable
    if (!this.df._data[this.groupVar]) {
      throw new Error(
        `Group variable '${this.groupVar}' not found in DataFrame`
      )
    }
  }

  _encodeDummies() {
    // Get unique levels of the group variable
    const levels = [...new Set(this.df._data[this.groupVar])].sort()

    // Create new DataFrame with dummy variables
    const dummyData = { ...this.df._data }

    // Add dummy columns for all but the first level
    levels.slice(1).forEach((level) => {
      const dummyName = `${this.groupVar}_${level}`
      dummyData[dummyName] = new Float64Array(
        this.df._data[this.groupVar].map((val) => (val === level ? 1 : 0))
      )
    })

    return {
      encodedData: new DataFrame(dummyData),
      levels,
    }
  }

  _buildDesignMatrix(df, predictors) {
    const n = df._length
    const p = predictors.length + 1 // +1 for intercept

    // Initialize X matrix with 1s for intercept
    const X = Array(n)
      .fill()
      .map(() => Array(p).fill(1))

    // Fill in predictor values
    predictors.forEach((pred, j) => {
      for (let i = 0; i < n; i++) {
        X[i][j + 1] = df._data[pred][i]
      }
    })

    // Get response variable
    const y = Array.from(df._data[this.dependentVar])

    return { X, y }
  }

  _fitModel(X, y, jStat) {
    const n = X.length
    const p = X[0].length

    // Compute X^T X
    const XtX = Array(p)
      .fill()
      .map(() => Array(p).fill(0))
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < p; j++) {
        for (let k = 0; k < p; k++) {
          XtX[j][k] += X[i][j] * X[i][k]
        }
      }
    }

    // Check invertibility
    if (Math.abs(jStat.det(XtX)) < 1e-12) {
      throw new Error("X^T X is singular or nearly singular")
    }

    // Compute X^T y
    const XtY = Array(p).fill(0)
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < p; j++) {
        XtY[j] += X[i][j] * y[i]
      }
    }

    // Solve for beta
    const XtX_inv = jStat.inv(XtX)
    const beta = XtX_inv.map((row) =>
      row.reduce((acc, val, idx) => acc + val * XtY[idx], 0)
    )

    // Calculate fitted values
    const yhat = X.map((row) =>
      row.reduce((acc, val, idx) => acc + val * beta[idx], 0)
    )

    // Calculate residuals and statistics
    const residuals = y.map((val, idx) => val - yhat[idx])
    const rss = residuals.reduce((acc, r) => acc + r * r, 0)
    const df = n - p
    const s2 = rss / df

    // Calculate standard errors and t-statistics
    const se = XtX_inv.map((row, i) => Math.sqrt(s2 * row[i]))
    const tStats = beta.map((b, i) => b / se[i])
    const pValues = tStats.map(
      (t) => 2 * (1 - jStat.studentt.cdf(Math.abs(t), df))
    )

    return {
      beta,
      se,
      tStats,
      pValues,
      yhat,
      residuals,
      rss,
      df,
      s2,
      XtX_inv,
    }
  }

  _partialFTest(
    RSS_reduced,
    RSS_full,
    df_reduced,
    df_full,
    nParamsAdded,
    jStat
  ) {
    const numerator = (RSS_reduced - RSS_full) / nParamsAdded
    const denominator = RSS_full / df_full
    const fStatistic = numerator / denominator
    const pValue = 1 - jStat.centralF.cdf(fStatistic, nParamsAdded, df_full)

    return { fStatistic, pValue }
  }
}

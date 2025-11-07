# Font Configuration

## Installed Fonts

The application uses three primary font families:

1. **Space Grotesk** - Modern geometric sans-serif
2. **Montserrat** - Clean, professional sans-serif
3. **Poppins** - Friendly, rounded sans-serif

## Default Usage

### Body Text
- **Default**: Poppins
- All body text, paragraphs, and general content uses Poppins

### Headings (h1-h6)
- **Default**: Space Grotesk (primary), Montserrat (fallback)
- All heading elements automatically use Space Grotesk

## Tailwind CSS Classes

You can use these custom font classes in your components:

```tsx
// Default sans-serif (Poppins)
<p className="font-sans">This uses Poppins</p>

// Headings (Space Grotesk + Montserrat)
<h1 className="font-heading">This uses Space Grotesk</h1>

// Body text (Poppins)
<p className="font-body">This uses Poppins</p>

// Display text (Montserrat)
<h1 className="font-display">This uses Montserrat</h1>
```

## Dashboard Specific Styles

### Dashboard Components
- **Titles**: Montserrat (`.dashboard-title`)
- **Text**: Poppins (`.dashboard-text`)
- **Page**: Poppins (`.dashboard-page`)

### Example Usage

```tsx
// In dashboard components
<div className="dashboard-page">
  <h1 className="dashboard-title">Dashboard Title</h1>
  <p className="dashboard-text">Dashboard content</p>
</div>
```

## Font Weights Available

All three fonts support multiple weights:
- 300 (Light)
- 400 (Regular)
- 500 (Medium)
- 600 (Semi-Bold)
- 700 (Bold)
- 800 (Extra-Bold) - Montserrat only
- 900 (Black) - Montserrat only

### Example

```tsx
<h1 className="font-heading font-bold">Bold Space Grotesk</h1>
<p className="font-body font-light">Light Poppins</p>
<h2 className="font-display font-black">Black Montserrat</h2>
```

## Import Source

Fonts are imported from Google Fonts in `client/global.css`:

```css
@import url("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600;700;800;900&display=swap");
```

## Best Practices

1. **Headings**: Use `font-heading` or let default h1-h6 styles apply
2. **Body Text**: Use `font-body` or `font-sans` (both use Poppins)
3. **Special Displays**: Use `font-display` for hero sections or special callouts
4. **Consistency**: Stick to the default styles unless you have a specific design reason to override

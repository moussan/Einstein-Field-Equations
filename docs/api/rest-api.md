# Einstein Field Equations Platform API Documentation

This document provides detailed information about the API endpoints, calculation types, and data models used in the Einstein Field Equations Platform.

## Table of Contents

1. [Authentication](#authentication)
2. [Calculations API](#calculations-api)
3. [Visualizations API](#visualizations-api)
4. [User Profiles API](#user-profiles-api)
5. [Edge Functions](#edge-functions)
6. [Data Models](#data-models)

## Authentication

The platform uses Supabase Authentication for user management. The following endpoints are available through the Supabase Auth API:

### Sign Up

```javascript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    data: {
      name: 'John Doe'
    }
  }
});
```

### Sign In

```javascript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});
```

### Sign Out

```javascript
const { error } = await supabase.auth.signOut();
```

### Password Reset

```javascript
const { data, error } = await supabase.auth.resetPasswordForEmail('user@example.com', {
  redirectTo: 'https://example.com/reset-password'
});
```

## Calculations API

The Calculations API allows users to perform various calculations related to Einstein's field equations.

### Calculation Types

The platform supports the following calculation types:

| Type | Description | Required Inputs |
|------|-------------|----------------|
| `schwarzschild` | Calculates the Schwarzschild metric | `mass`, `radius`, `theta` |
| `kerr` | Calculates the Kerr metric | `mass`, `angular_momentum`, `radius`, `theta` |
| `flrw` | Calculates the FLRW metric | `scale_factor`, `k`, `radius`, `theta` |
| `christoffel_symbols` | Calculates Christoffel symbols | `metric_type`, plus inputs for that metric |
| `ricci_tensor` | Calculates the Ricci tensor | `metric_type`, plus inputs for that metric |
| `riemann_tensor` | Calculates the Riemann tensor | `metric_type`, plus inputs for that metric |
| `einstein_tensor` | Calculates the Einstein tensor | `metric_type`, plus inputs for that metric |
| `weyl_tensor` | Calculates the Weyl tensor | `metric_type`, plus inputs for that metric |
| `geodesic_equation` | Calculates the geodesic equation | `metric_type`, `initial_position`, `initial_velocity` |
| `event_horizon` | Calculates the event horizon | `mass`, `angular_momentum`, `charge` |
| `gravitational_redshift` | Calculates gravitational redshift | `mass`, `emission_radius`, `observation_radius` |
| `gravitational_lensing` | Calculates gravitational lensing | `mass`, `impact_parameter` |
| `gravitational_waves` | Calculates gravitational waves | `mass1`, `mass2`, `distance`, `frequency` |
| `energy_conditions` | Checks energy conditions | `energy_density`, `pressure` |
| `stress_energy_tensor` | Calculates the stress-energy tensor | `energy_density`, `pressure`, `velocity` |
| `vacuum_solution` | Calculates vacuum solutions | `solution_type`, plus specific inputs |
| `matter_solution` | Calculates matter solutions | `solution_type`, `energy_density`, `pressure` |
| `reissner_nordstrom` | Calculates the Reissner-Nordström metric | `mass`, `charge`, `radius`, `theta` |
| `kerr_newman` | Calculates the Kerr-Newman metric | `mass`, `charge`, `angular_momentum`, `radius`, `theta` |
| `godel_metric` | Calculates the Gödel metric | `omega`, `radius`, `phi`, `z` |
| `friedmann_equations` | Calculates Friedmann equations | `scale_factor`, `energy_density`, `pressure`, `cosmological_constant` |
| `bianchi_identities` | Verifies Bianchi identities | `metric_type`, plus inputs for that metric |
| `kretschmann_scalar` | Calculates the Kretschmann scalar | `metric_type`, plus inputs for that metric |
| `penrose_diagram` | Generates Penrose diagram data | `metric_type`, plus inputs for that metric |
| `hawking_radiation` | Calculates Hawking radiation | `mass`, `charge`, `angular_momentum` |
| `black_hole_thermodynamics` | Calculates black hole thermodynamics | `mass`, `charge`, `angular_momentum` |
| `cosmological_constant` | Calculates effects of cosmological constant | `lambda_value` |
| `dark_energy` | Models dark energy | `equation_of_state`, `energy_density` |
| `dark_matter` | Models dark matter | `density_profile`, `mass` |
| `inflation_model` | Calculates inflation model | `potential`, `initial_conditions` |
| `wormhole_solution` | Calculates wormhole solutions | `throat_radius`, `shape_function` |

### Perform Calculation

**Endpoint:** `POST /api/calculations`

**Request:**
```javascript
const { data, error } = await performCalculation('schwarzschild', {
  mass: 1.0,
  radius: 10.0,
  theta: Math.PI / 2
});
```

**Response:**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "type": "schwarzschild",
    "inputs": {
      "mass": 1.0,
      "radius": 10.0,
      "theta": 1.5707963267948966
    },
    "results": {
      "metricComponents": {
        "g_tt": -0.8,
        "g_rr": 1.25,
        "g_theta_theta": 100,
        "g_phi_phi": 100
      },
      "ricciscalar": 0,
      "eventHorizon": 2
    },
    "calculation_time": 0.0023,
    "created_at": "2023-05-15T14:30:00Z",
    "updated_at": "2023-05-15T14:30:00Z",
    "user_id": "auth0|123456789",
    "is_public": false
  }
}
```

### Get User Calculations

**Endpoint:** `GET /api/calculations`

**Request:**
```javascript
const { data, error, count, pageSize } = await getUserCalculations(1, 10);
```

**Response:**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "type": "schwarzschild",
      "inputs": { "mass": 1.0, "radius": 10.0, "theta": 1.5707963267948966 },
      "results": { "metricComponents": { "g_tt": -0.8, "g_rr": 1.25, "g_theta_theta": 100, "g_phi_phi": 100 } },
      "created_at": "2023-05-15T14:30:00Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "type": "kerr",
      "inputs": { "mass": 1.0, "angular_momentum": 0.5, "radius": 10.0, "theta": 1.5707963267948966 },
      "results": { "metricComponents": { "g_tt": -0.85, "g_rr": 1.2, "g_theta_theta": 100, "g_phi_phi": 110 } },
      "created_at": "2023-05-14T10:15:00Z"
    }
  ],
  "count": 15,
  "page": 1,
  "pageSize": 10
}
```

### Get Public Calculations

**Endpoint:** `GET /api/calculations/public`

**Request:**
```javascript
const { data, error, count, pageSize } = await getPublicCalculations(1, 10);
```

**Response:** Similar to Get User Calculations, but only includes public calculations.

### Get Calculation by ID

**Endpoint:** `GET /api/calculations/:id`

**Request:**
```javascript
const { data, error } = await getCalculation('550e8400-e29b-41d4-a716-446655440000');
```

**Response:** Returns a single calculation object.

### Update Calculation

**Endpoint:** `PUT /api/calculations/:id`

**Request:**
```javascript
const { data, error } = await updateCalculation('550e8400-e29b-41d4-a716-446655440000', {
  is_public: true,
  description: 'Schwarzschild metric for a solar mass black hole'
});
```

**Response:** Returns the updated calculation object.

### Delete Calculation

**Endpoint:** `DELETE /api/calculations/:id`

**Request:**
```javascript
const { error } = await deleteCalculation('550e8400-e29b-41d4-a716-446655440000');
```

**Response:** Returns success or error.

## Visualizations API

The Visualizations API allows users to save, retrieve, and manage visualizations.

### Save Visualization

**Endpoint:** `POST /api/visualizations`

**Request:**
```javascript
const { data, error } = await saveVisualization(
  'Black Hole Event Horizon',
  'Visualization of a Schwarzschild black hole event horizon',
  'spacetime_diagram',
  { type: 'schwarzschild', mass: 1.0, view_angle: 45 },
  true // is_public
);
```

**Response:**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "title": "Black Hole Event Horizon",
    "description": "Visualization of a Schwarzschild black hole event horizon",
    "visualization_type": "spacetime_diagram",
    "parameters": {
      "type": "schwarzschild",
      "mass": 1.0,
      "view_angle": 45
    },
    "is_public": true,
    "created_at": "2023-05-15T15:45:00Z",
    "updated_at": "2023-05-15T15:45:00Z",
    "user_id": "auth0|123456789",
    "thumbnail_url": null
  }
}
```

### Get User Visualizations

**Endpoint:** `GET /api/visualizations`

**Request:**
```javascript
const { data, error, count, pageSize } = await getUserVisualizations(1, 10);
```

**Response:** Returns a list of visualizations with pagination info.

### Get Public Visualizations

**Endpoint:** `GET /api/visualizations/public`

**Request:**
```javascript
const { data, error, count, pageSize } = await getPublicVisualizations(1, 10);
```

**Response:** Returns a list of public visualizations with pagination info.

### Get Visualization by ID

**Endpoint:** `GET /api/visualizations/:id`

**Request:**
```javascript
const { data, error } = await getVisualization('550e8400-e29b-41d4-a716-446655440002');
```

**Response:** Returns a single visualization object.

### Update Visualization

**Endpoint:** `PUT /api/visualizations/:id`

**Request:**
```javascript
const { data, error } = await updateVisualization('550e8400-e29b-41d4-a716-446655440002', {
  title: 'Updated Title',
  is_public: false
});
```

**Response:** Returns the updated visualization object.

### Delete Visualization

**Endpoint:** `DELETE /api/visualizations/:id`

**Request:**
```javascript
const { error } = await deleteVisualization('550e8400-e29b-41d4-a716-446655440002');
```

**Response:** Returns success or error.

### Upload Thumbnail

**Endpoint:** `POST /api/visualizations/:id/thumbnail`

**Request:**
```javascript
const { data, error } = await uploadThumbnail(file, '550e8400-e29b-41d4-a716-446655440002');
```

**Response:** Returns the updated visualization with thumbnail URL.

## User Profiles API

The User Profiles API allows users to manage their profiles and preferences.

### Get User Profile

**Endpoint:** `GET /api/profiles`

**Request:**
```javascript
const { data, error } = await getProfile();
```

**Response:**
```json
{
  "data": {
    "id": "auth0|123456789",
    "display_name": "John Doe",
    "avatar_url": "https://example.com/avatar.jpg",
    "website": "https://johndoe.com",
    "bio": "Physicist and programmer",
    "created_at": "2023-01-15T10:00:00Z",
    "updated_at": "2023-05-10T14:20:00Z"
  }
}
```

### Update User Profile

**Endpoint:** `PUT /api/profiles`

**Request:**
```javascript
const { data, error } = await updateProfile({
  display_name: "Dr. John Doe",
  bio: "Theoretical physicist specializing in general relativity"
});
```

**Response:** Returns the updated profile.

### Get User Preferences

**Endpoint:** `GET /api/preferences`

**Request:**
```javascript
const { data, error } = await supabase
  .from('user_preferences')
  .select('*')
  .eq('user_id', user.id)
  .single();
```

**Response:**
```json
{
  "data": {
    "user_id": "auth0|123456789",
    "default_coordinate_system": "spherical",
    "theme": "dark",
    "visualization_settings": {
      "colorScheme": "viridis",
      "showGrid": true,
      "showAxes": true
    },
    "notification_settings": {
      "email": true,
      "push": false
    },
    "created_at": "2023-01-15T10:00:00Z",
    "updated_at": "2023-05-12T09:30:00Z"
  }
}
```

### Update User Preferences

**Endpoint:** `PUT /api/preferences`

**Request:**
```javascript
const { data, error } = await supabase
  .from('user_preferences')
  .update({
    theme: 'light',
    default_coordinate_system: 'cartesian'
  })
  .eq('user_id', user.id)
  .select()
  .single();
```

**Response:** Returns the updated preferences.

## Edge Functions

The platform uses Supabase Edge Functions for complex calculations. The main Edge Function is:

### Calculate

**Endpoint:** `POST /functions/v1/calculate`

**Request:**
```javascript
const { data, error } = await supabase.functions.invoke('calculate', {
  body: {
    type: 'schwarzschild',
    inputs: {
      mass: 1.0,
      radius: 10.0,
      theta: Math.PI / 2
    }
  }
});
```

**Response:**
```json
{
  "results": {
    "metricComponents": {
      "g_tt": -0.8,
      "g_rr": 1.25,
      "g_theta_theta": 100,
      "g_phi_phi": 100
    },
    "ricciscalar": 0,
    "eventHorizon": 2
  },
  "calculation_time": 0.0023
}
```

## Data Models

### Profiles

```sql
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  website TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Calculations

```sql
CREATE TABLE public.calculations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type calculation_type NOT NULL,
  inputs JSONB NOT NULL,
  results JSONB,
  calculation_time FLOAT,
  is_public BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Saved Visualizations

```sql
CREATE TABLE public.saved_visualizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  visualization_type TEXT NOT NULL,
  parameters JSONB NOT NULL,
  thumbnail_url TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### User Preferences

```sql
CREATE TABLE public.user_preferences (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  default_coordinate_system coordinate_system DEFAULT 'cartesian',
  theme TEXT DEFAULT 'light',
  visualization_settings JSONB DEFAULT '{}'::jsonb,
  notification_settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
``` 
import numpy as np
from typing import Dict, List, Tuple

def calculate_christoffel_symbols(metric: Dict[str, float], coords: Dict[str, float]) -> Dict[str, float]:
    """
    Calculate Christoffel symbols of the second kind.
    Γᵍₐᵦ = (1/2)gᵍᵈ(∂ₐgᵦᵈ + ∂ᵦgₐᵈ - ∂ᵈgₐᵦ)
    """
    # Extract coordinates
    r = coords["radius"]
    theta = coords["theta"]
    
    # Initialize arrays for metric and its inverse
    dim = 4
    g = np.zeros((dim, dim))
    
    # Fill metric tensor
    g[0,0] = metric["g_tt"]
    g[1,1] = metric["g_rr"]
    g[2,2] = metric["g_theta_theta"]
    g[3,3] = metric["g_phi_phi"]
    
    # Calculate inverse metric
    g_inv = np.linalg.inv(g)
    
    # Initialize Christoffel symbols
    gamma = np.zeros((dim, dim, dim))
    
    # Calculate derivatives of metric components
    # This is metric-specific and needs to be handled separately for each case
    def get_metric_derivatives(metric_type: str) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        if metric_type == "schwarzschild":
            # ∂ᵣg_μν
            dg_dr = np.zeros((dim, dim))
            dg_dr[0,0] = -2 * coords["mass"] / r**2
            dg_dr[1,1] = 2 * coords["mass"] / (r**2 * (1 - 2*coords["mass"]/r)**2)
            dg_dr[2,2] = 2 * r
            dg_dr[3,3] = 2 * r * np.sin(theta)**2
            
            # ∂_θg_μν
            dg_dtheta = np.zeros((dim, dim))
            dg_dtheta[3,3] = 2 * r**2 * np.sin(theta) * np.cos(theta)
            
            # ∂_φg_μν
            dg_dphi = np.zeros((dim, dim))
            
            return dg_dr, dg_dtheta, dg_dphi
        
        elif metric_type == "kerr":
            a = coords["angular_momentum"]
            rho2 = r**2 + a**2 * np.cos(theta)**2
            delta = r**2 - 2*coords["mass"]*r + a**2
            
            # Derivatives are more complex for Kerr metric
            # This is a simplified version focusing on main components
            dg_dr = np.zeros((dim, dim))
            dg_dtheta = np.zeros((dim, dim))
            dg_dphi = np.zeros((dim, dim))
            
            # Add key derivatives (simplified)
            dg_dr[0,0] = -2*coords["mass"]*(rho2 - 2*r**2)/(rho2**2)
            dg_dr[1,1] = -2*(r - coords["mass"])/(delta**2)
            
            return dg_dr, dg_dtheta, dg_dphi
        
        else:  # reissner-nordstrom
            Q2 = coords["charge"]**2
            
            dg_dr = np.zeros((dim, dim))
            dg_dr[0,0] = -2*(-coords["mass"]/r**2 + Q2/r**3)
            dg_dr[1,1] = 2*(coords["mass"]/r**2 - Q2/r**3)/(1 - 2*coords["mass"]/r + Q2/r**2)**2
            dg_dr[2,2] = 2*r
            dg_dr[3,3] = 2*r*np.sin(theta)**2
            
            dg_dtheta = np.zeros((dim, dim))
            dg_dtheta[3,3] = 2*r**2*np.sin(theta)*np.cos(theta)
            
            dg_dphi = np.zeros((dim, dim))
            
            return dg_dr, dg_dtheta, dg_dphi
    
    # Get metric derivatives based on type
    metric_type = coords.get("metric_type", "schwarzschild")
    dg_dr, dg_dtheta, dg_dphi = get_metric_derivatives(metric_type)
    
    # Calculate Christoffel symbols
    for mu in range(dim):
        for alpha in range(dim):
            for beta in range(dim):
                gamma[mu,alpha,beta] = 0
                for sigma in range(dim):
                    gamma[mu,alpha,beta] += 0.5 * g_inv[mu,sigma] * (
                        dg_dr[beta,sigma] * (alpha == 1) +
                        dg_dr[alpha,sigma] * (beta == 1) -
                        dg_dr[sigma,alpha] * (beta == 1) +
                        dg_dtheta[beta,sigma] * (alpha == 2) +
                        dg_dtheta[alpha,sigma] * (beta == 2) -
                        dg_dtheta[sigma,alpha] * (beta == 2) +
                        dg_dphi[beta,sigma] * (alpha == 3) +
                        dg_dphi[alpha,sigma] * (beta == 3) -
                        dg_dphi[sigma,alpha] * (beta == 3)
                    )
    
    # Convert to dictionary format
    christoffel_dict = {}
    for mu in range(dim):
        for alpha in range(dim):
            for beta in range(dim):
                if abs(gamma[mu,alpha,beta]) > 1e-10:  # Only store non-zero components
                    christoffel_dict[f"Γ{mu}_{alpha}{beta}"] = float(gamma[mu,alpha,beta])
    
    return christoffel_dict

def calculate_riemann_tensor(metric: Dict[str, float], christoffel: Dict[str, float], coords: Dict[str, float]) -> Dict[str, float]:
    """
    Calculate the Riemann curvature tensor.
    Rᵈₐᵦᵧ = ∂ᵦΓᵈₐᵧ - ∂ᵧΓᵈₐᵦ + ΓᵈₑᵦΓˢₐᵧ - ΓᵈₑᵧΓˢₐᵦ
    """
    dim = 4
    riemann = np.zeros((dim, dim, dim, dim))
    
    # Convert Christoffel symbols to array format
    gamma = np.zeros((dim, dim, dim))
    for key, value in christoffel.items():
        indices = [int(i) for i in key.replace("Γ", "").replace("_", "")]
        gamma[indices[0], indices[1], indices[2]] = value
    
    # Calculate Riemann tensor components
    # This is a simplified calculation focusing on key components
    r = coords["radius"]
    M = coords["mass"]
    
    if coords.get("metric_type") == "schwarzschild":
        # Key components for Schwarzschild metric
        riemann[0,1,0,1] = 2*M/(r**3 * (1 - 2*M/r))
        riemann[0,1,1,0] = -2*M/(r**3 * (1 - 2*M/r))
        riemann[2,3,2,3] = 2*M/r
        riemann[2,3,3,2] = -2*M/r
    
    elif coords.get("metric_type") == "kerr":
        # Simplified key components for Kerr metric
        a = coords["angular_momentum"]
        theta = coords["theta"]
        rho2 = r**2 + a**2 * np.cos(theta)**2
        
        riemann[0,1,0,1] = M*(r**2 - a**2*np.cos(theta)**2)/(rho2**3)
        riemann[0,2,0,2] = -M*r/(rho2**2)
    
    else:  # Reissner-Nordstrom
        Q = coords["charge"]
        riemann[0,1,0,1] = (2*M*r - Q**2)/(r**4)
        riemann[2,3,2,3] = (2*M*r - Q**2)/(r**4)
    
    # Convert to dictionary format
    riemann_dict = {}
    for mu in range(dim):
        for alpha in range(dim):
            for beta in range(dim):
                for gamma in range(dim):
                    if abs(riemann[mu,alpha,beta,gamma]) > 1e-10:
                        riemann_dict[f"R{mu}_{alpha}{beta}{gamma}"] = float(riemann[mu,alpha,beta,gamma])
    
    return riemann_dict

def calculate_ricci_tensor(riemann: Dict[str, float]) -> Dict[str, float]:
    """
    Calculate the Ricci tensor by contracting the Riemann tensor.
    Rᵢⱼ = Rᵏᵢₖⱼ
    """
    dim = 4
    ricci = np.zeros((dim, dim))
    
    # Convert Riemann components to array
    riemann_array = np.zeros((dim, dim, dim, dim))
    for key, value in riemann.items():
        indices = [int(i) for i in key.replace("R", "").replace("_", "")]
        riemann_array[indices[0], indices[1], indices[2], indices[3]] = value
    
    # Calculate Ricci tensor by contraction
    for i in range(dim):
        for j in range(dim):
            for k in range(dim):
                ricci[i,j] += riemann_array[k,i,k,j]
    
    # Convert to dictionary format
    ricci_dict = {}
    for i in range(dim):
        for j in range(dim):
            if abs(ricci[i,j]) > 1e-10:
                ricci_dict[f"R_{i}{j}"] = float(ricci[i,j])
    
    return ricci_dict

def calculate_ricci_scalar(ricci: Dict[str, float], metric: Dict[str, float]) -> float:
    """
    Calculate the Ricci scalar (scalar curvature).
    R = gᵢⱼRᵢⱼ
    """
    dim = 4
    g_inv = np.zeros((dim, dim))
    ricci_tensor = np.zeros((dim, dim))
    
    # Convert metric to array and invert
    g = np.zeros((dim, dim))
    g[0,0] = metric["g_tt"]
    g[1,1] = metric["g_rr"]
    g[2,2] = metric["g_theta_theta"]
    g[3,3] = metric["g_phi_phi"]
    g_inv = np.linalg.inv(g)
    
    # Convert Ricci tensor to array
    for key, value in ricci.items():
        indices = [int(i) for i in key.replace("R_", "")]
        ricci_tensor[indices[0], indices[1]] = value
    
    # Calculate scalar curvature
    R = 0
    for i in range(dim):
        for j in range(dim):
            R += g_inv[i,j] * ricci_tensor[i,j]
    
    return float(R) 
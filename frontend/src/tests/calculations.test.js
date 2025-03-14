import { 
  getUserCalculations, 
  getPublicCalculations, 
  getCalculation, 
  createCalculation, 
  updateCalculation, 
  deleteCalculation, 
  performCalculation 
} from '../utils/calculations';
import supabase from '../utils/supabase';

// Mock Supabase client
jest.mock('../utils/supabase', () => ({
  from: jest.fn(),
  functions: {
    invoke: jest.fn()
  }
}));

describe('Calculation Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserCalculations', () => {
    it('should fetch user calculations with pagination', async () => {
      // Mock data
      const mockData = [
        { id: '1', type: 'schwarzschild', inputs: { mass: 1 } },
        { id: '2', type: 'kerr', inputs: { mass: 1, angular_momentum: 0.5 } }
      ];
      
      // Mock Supabase response
      const mockSelect = jest.fn().mockReturnValue({
        order: jest.fn().mockReturnValue({
          range: jest.fn().mockResolvedValue({
            data: mockData,
            error: null,
            count: 10
          })
        })
      });
      
      supabase.from.mockReturnValue({
        select: mockSelect
      });
      
      // Call the function
      const result = await getUserCalculations(1, 5);
      
      // Assertions
      expect(supabase.from).toHaveBeenCalledWith('calculations');
      expect(mockSelect).toHaveBeenCalledWith('*', { count: 'exact' });
      expect(result).toEqual({
        data: mockData,
        error: null,
        count: 10,
        page: 1,
        pageSize: 5
      });
    });
    
    it('should handle errors', async () => {
      // Mock error
      const mockError = { message: 'Database error' };
      
      // Mock Supabase response
      const mockSelect = jest.fn().mockReturnValue({
        order: jest.fn().mockReturnValue({
          range: jest.fn().mockResolvedValue({
            data: null,
            error: mockError,
            count: null
          })
        })
      });
      
      supabase.from.mockReturnValue({
        select: mockSelect
      });
      
      // Call the function
      const result = await getUserCalculations(1, 5);
      
      // Assertions
      expect(result).toEqual({
        data: null,
        error: mockError,
        count: null,
        page: 1,
        pageSize: 5
      });
    });
  });

  describe('getPublicCalculations', () => {
    it('should fetch public calculations with pagination', async () => {
      // Mock data
      const mockData = [
        { id: '1', type: 'schwarzschild', inputs: { mass: 1 }, is_public: true },
        { id: '2', type: 'kerr', inputs: { mass: 1, angular_momentum: 0.5 }, is_public: true }
      ];
      
      // Mock Supabase response
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            range: jest.fn().mockResolvedValue({
              data: mockData,
              error: null,
              count: 15
            })
          })
        })
      });
      
      supabase.from.mockReturnValue({
        select: mockSelect
      });
      
      // Call the function
      const result = await getPublicCalculations(1, 5);
      
      // Assertions
      expect(supabase.from).toHaveBeenCalledWith('calculations');
      expect(mockSelect).toHaveBeenCalledWith('*, profiles(display_name)', { count: 'exact' });
      expect(result).toEqual({
        data: mockData,
        error: null,
        count: 15,
        page: 1,
        pageSize: 5
      });
    });
  });

  describe('getCalculation', () => {
    it('should fetch a specific calculation by ID', async () => {
      // Mock data
      const mockData = { 
        id: '1', 
        type: 'schwarzschild', 
        inputs: { mass: 1 },
        results: { metricComponents: { g_tt: -0.8 } }
      };
      
      // Mock Supabase response
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockData,
            error: null
          })
        })
      });
      
      supabase.from.mockReturnValue({
        select: mockSelect
      });
      
      // Call the function
      const result = await getCalculation('1');
      
      // Assertions
      expect(supabase.from).toHaveBeenCalledWith('calculations');
      expect(mockSelect).toHaveBeenCalledWith('*, profiles(display_name)');
      expect(result).toEqual({
        data: mockData,
        error: null
      });
    });
  });

  describe('createCalculation', () => {
    it('should create a new calculation', async () => {
      // Mock data
      const calculationData = { 
        type: 'schwarzschild', 
        inputs: { mass: 1 },
        is_public: false
      };
      
      const mockData = { 
        id: '1', 
        ...calculationData,
        created_at: '2023-05-15T14:30:00Z'
      };
      
      // Mock Supabase response
      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockData,
            error: null
          })
        })
      });
      
      supabase.from.mockReturnValue({
        insert: mockInsert
      });
      
      // Call the function
      const result = await createCalculation(calculationData);
      
      // Assertions
      expect(supabase.from).toHaveBeenCalledWith('calculations');
      expect(mockInsert).toHaveBeenCalledWith(calculationData);
      expect(result).toEqual({
        data: mockData,
        error: null
      });
    });
  });

  describe('updateCalculation', () => {
    it('should update an existing calculation', async () => {
      // Mock data
      const updates = { 
        is_public: true,
        description: 'Updated description'
      };
      
      const mockData = { 
        id: '1', 
        type: 'schwarzschild',
        inputs: { mass: 1 },
        ...updates,
        updated_at: '2023-05-15T15:30:00Z'
      };
      
      // Mock Supabase response
      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockData,
              error: null
            })
          })
        })
      });
      
      supabase.from.mockReturnValue({
        update: mockUpdate
      });
      
      // Call the function
      const result = await updateCalculation('1', updates);
      
      // Assertions
      expect(supabase.from).toHaveBeenCalledWith('calculations');
      expect(mockUpdate).toHaveBeenCalledWith(updates);
      expect(result).toEqual({
        data: mockData,
        error: null
      });
    });
  });

  describe('deleteCalculation', () => {
    it('should delete a calculation', async () => {
      // Mock Supabase response
      const mockDelete = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          error: null
        })
      });
      
      supabase.from.mockReturnValue({
        delete: mockDelete
      });
      
      // Call the function
      const result = await deleteCalculation('1');
      
      // Assertions
      expect(supabase.from).toHaveBeenCalledWith('calculations');
      expect(mockDelete).toHaveBeenCalled();
      expect(result).toEqual({
        error: null
      });
    });
  });

  describe('performCalculation', () => {
    it('should perform a calculation and store the results', async () => {
      // Mock data
      const calculationType = 'schwarzschild';
      const inputs = { mass: 1, radius: 10, theta: Math.PI / 2 };
      
      const createdCalculation = { 
        id: '1', 
        type: calculationType,
        inputs,
        is_public: false,
        created_at: '2023-05-15T14:30:00Z'
      };
      
      const edgeFunctionResult = {
        results: {
          metricComponents: {
            g_tt: -0.8,
            g_rr: 1.25,
            g_theta_theta: 100,
            g_phi_phi: 100
          },
          ricciscalar: 0,
          eventHorizon: 2
        },
        calculation_time: 0.0023
      };
      
      const updatedCalculation = {
        ...createdCalculation,
        results: edgeFunctionResult.results,
        calculation_time: edgeFunctionResult.calculation_time,
        updated_at: '2023-05-15T14:30:05Z'
      };
      
      // Mock createCalculation
      const mockCreateInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: createdCalculation,
            error: null
          })
        })
      });
      
      // Mock Edge Function
      supabase.functions.invoke.mockResolvedValue({
        data: edgeFunctionResult,
        error: null
      });
      
      // Mock updateCalculation
      const mockUpdateUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: updatedCalculation,
              error: null
            })
          })
        })
      });
      
      // Set up the mocks in sequence
      supabase.from.mockReturnValueOnce({
        insert: mockCreateInsert
      }).mockReturnValueOnce({
        update: mockUpdateUpdate
      });
      
      // Call the function
      const result = await performCalculation(calculationType, inputs);
      
      // Assertions
      expect(supabase.from).toHaveBeenCalledWith('calculations');
      expect(mockCreateInsert).toHaveBeenCalled();
      expect(supabase.functions.invoke).toHaveBeenCalledWith('calculate', {
        body: { type: calculationType, inputs }
      });
      expect(mockUpdateUpdate).toHaveBeenCalled();
      expect(result).toEqual({
        data: updatedCalculation,
        error: null
      });
    });
    
    it('should handle errors from the Edge Function', async () => {
      // Mock data
      const calculationType = 'schwarzschild';
      const inputs = { mass: 1, radius: 10, theta: Math.PI / 2 };
      
      const createdCalculation = { 
        id: '1', 
        type: calculationType,
        inputs,
        is_public: false,
        created_at: '2023-05-15T14:30:00Z'
      };
      
      const edgeFunctionError = {
        message: 'Calculation error'
      };
      
      // Mock createCalculation
      const mockCreateInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: createdCalculation,
            error: null
          })
        })
      });
      
      // Mock Edge Function with error
      supabase.functions.invoke.mockResolvedValue({
        data: null,
        error: edgeFunctionError
      });
      
      // Set up the mock
      supabase.from.mockReturnValue({
        insert: mockCreateInsert
      });
      
      // Call the function
      const result = await performCalculation(calculationType, inputs);
      
      // Assertions
      expect(supabase.from).toHaveBeenCalledWith('calculations');
      expect(mockCreateInsert).toHaveBeenCalled();
      expect(supabase.functions.invoke).toHaveBeenCalledWith('calculate', {
        body: { type: calculationType, inputs }
      });
      expect(result).toEqual({
        data: null,
        error: edgeFunctionError
      });
    });
  });
}); 
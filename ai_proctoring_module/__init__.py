"""
AI Proctoring Module
===================

A unified proctoring suite that combines all detection features from the original 
AI-based Online Exam Proctoring System into easy-to-use classes.

Classes:
    ProctoringSuite: Full-featured proctoring with all detection modules
    ProctoringLite: Lightweight version with essential features only

Example:
    from ai_proctoring_module import ProctoringSuite
    
    proctoring = ProctoringSuite()
    proctoring.start_proctoring_session()
"""

from .proctoring_suite import ProctoringSuite
from .proctoring_lite import ProctoringLite

__version__ = "1.0.0"
__author__ = "Extracted from AI-based Online Exam Proctoring System"

__all__ = ['ProctoringSuite', 'ProctoringLite']

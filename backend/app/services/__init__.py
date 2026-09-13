from app.services.recommendation_srv import RecommendationService
from app.services.explainability_srv import ExplainabilityService
from app.services.train_tracking_srv import TrainTrackingService
from app.core.state_manager import state_mgr

recommendation_srv = RecommendationService(state_mgr)
explainability_srv = ExplainabilityService(state_mgr)
train_tracking_srv = TrainTrackingService(state_mgr)

__all__ = [
    "RecommendationService",
    "ExplainabilityService",
    "TrainTrackingService",
    "recommendation_srv",
    "explainability_srv",
    "train_tracking_srv",
]

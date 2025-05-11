#pragma once

// Board configuration header
// This file includes the appropriate pin definitions based on build flags

#if defined(CONFIG_FABREADER)
#include "configs/fabreader.h"
// Additional board configurations can be added here
#else
#error "No board configuration selected"
#endif
